"use client";
import { useAuth } from "@clerk/nextjs";
import type { Citation } from "@usemoos/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, apiJson } from "./api";

export interface UserMessage {
  id: string;
  role: "user";
  content: string;
}

export interface AssistantMessage {
  id: string;
  role: "assistant";
  content: string;
  citations: Citation[];
  isStreaming?: boolean;
}

export type ChatMsg = UserMessage | AssistantMessage;

interface StoredMessage {
  id: string;
  role: string;
  content: string;
  citations: unknown;
}

interface SseEvent {
  type: string;
  conversationId?: string;
  text?: string;
  citations?: Citation[];
}

interface UseChatStreamOptions {
  conversationId?: string | null;
  initialQuery?: string | null;
  userDisplayName?: string;
  onConversationCreated?: (id: string) => void;
  onCitationsUpdate?: (citations: Citation[]) => void;
}

export function useChatStream({
  conversationId: initialConvId,
  initialQuery,
  userDisplayName,
  onConversationCreated,
  onCitationsUpdate,
}: UseChatStreamOptions = {}) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConvId ?? null,
  );

  const isStreamingRef = useRef(false);
  const sentInitialRef = useRef(false);
  const onConversationCreatedRef = useRef(onConversationCreated);
  const onCitationsUpdateRef = useRef(onCitationsUpdate);

  useEffect(() => {
    onConversationCreatedRef.current = onConversationCreated;
  });
  useEffect(() => {
    onCitationsUpdateRef.current = onCitationsUpdate;
  });

  useEffect(() => {
    if (!initialConvId) return;
    let cancelled = false;
    setIsLoadingHistory(true);
    (async () => {
      const token = await getToken();
      if (!token) {
        if (!cancelled) setIsLoadingHistory(false);
        return;
      }
      try {
        const msgs = await apiJson<StoredMessage[]>(
          `/chat/conversations/${initialConvId}/messages`,
          token,
        );
        if (cancelled) return;
        const loadedMessages = msgs.map((m) =>
          m.role === "assistant"
            ? {
                id: m.id,
                role: "assistant" as const,
                content: m.content,
                citations: (m.citations as Citation[]) ?? [],
              }
            : { id: m.id, role: "user" as const, content: m.content },
        );
        setMessages(loadedMessages);
      } catch {
        // History load failed; user can still send messages.
      } finally {
        if (!cancelled) setIsLoadingHistory(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getToken, initialConvId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (isStreamingRef.current) return;
      const token = await getToken();
      if (!token) return;

      const userMsgId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: "user" as const, content: text },
      ]);

      const assistantMsgId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant" as const,
          content: "",
          citations: [],
          isStreaming: true,
        },
      ]);

      isStreamingRef.current = true;
      setIsStreaming(true);

      try {
        const res = await apiFetch("/chat/message", token, {
          method: "POST",
          body: JSON.stringify({
            message: text,
            conversationId: conversationId ?? undefined,
            userDisplayName: userDisplayName ?? undefined,
          }),
        });

        if (!res.ok || !res.body) {
          setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            let event: SseEvent;
            try {
              event = JSON.parse(raw);
            } catch {
              continue;
            }

            if (event.type === "meta" && event.conversationId) {
              setConversationId(event.conversationId);
              onConversationCreatedRef.current?.(event.conversationId);
            } else if (event.type === "text" && event.text) {
              const chunk = event.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: (m as AssistantMessage).content + chunk,
                      }
                    : m,
                ),
              );
            } else if (event.type === "citations" && event.citations) {
              const cits = event.citations;
              onCitationsUpdateRef.current?.(cits);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, citations: cits } : m,
                ),
              );
            } else if (event.type === "done") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, isStreaming: false } : m,
                ),
              );
            }
          }
        }
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
      } finally {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, isStreaming: false } : m,
          ),
        );
        isStreamingRef.current = false;
        setIsStreaming(false);
      }
    },
    [getToken, conversationId, userDisplayName],
  );

  // Auto-send the initial query once on mount (new conversation only)
  useEffect(() => {
    if (!initialQuery || initialConvId || sentInitialRef.current) return;
    sentInitialRef.current = true;
    sendMessage(initialQuery);
  }, [initialQuery, initialConvId, sendMessage]);

  return {
    messages,
    isStreaming,
    conversationId,
    isLoadingHistory,
    sendMessage,
  };
}
