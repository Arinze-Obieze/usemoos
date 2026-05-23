import { create } from "zustand";

interface WorkspaceStore {
  pendingQuery: string | null;
  pendingConversationId: string | null;
  setPendingQuery: (q: string | null) => void;
  setPendingConversationId: (id: string | null) => void;
  consumePending: () => { query: string | null; conversationId: string | null };
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  pendingQuery: null,
  pendingConversationId: null,
  setPendingQuery: (q) => set({ pendingQuery: q }),
  setPendingConversationId: (id) => set({ pendingConversationId: id }),
  consumePending: () => {
    const { pendingQuery, pendingConversationId } = get();
    set({ pendingQuery: null, pendingConversationId: null });
    return { query: pendingQuery, conversationId: pendingConversationId };
  },
}));
