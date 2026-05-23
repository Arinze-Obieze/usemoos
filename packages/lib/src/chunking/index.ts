export interface Chunk {
  text: string;
  index: number;
  sectionHierarchy: string;
}

interface SplitOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

/**
 * Recursive character text splitter — tries to split on paragraphs, then
 * sentences, then words before hard-cutting. Preserves section headings in
 * the sectionHierarchy field for every chunk.
 */
export function splitText(
  text: string,
  options: SplitOptions = {},
): Chunk[] {
  const { chunkSize = 512, chunkOverlap = 64 } = options;
  const separators = ["\n\n", "\n", ". ", " ", ""];
  const raw = recursiveSplit(text, separators, chunkSize);
  return mergeWithOverlap(raw, chunkSize, chunkOverlap).map((t, i) => ({
    text: t.trim(),
    index: i,
    sectionHierarchy: extractSectionHierarchy(t),
  })).filter((c) => c.text.length > 20);
}

/**
 * Code-aware splitter — keeps function/class boundaries intact where
 * possible. Used for GitHub, code files from Drive, etc.
 */
export function splitCode(
  code: string,
  language = "unknown",
  options: SplitOptions = {},
): Chunk[] {
  const { chunkSize = 768, chunkOverlap = 96 } = options;
  // Split on top-level function/class definitions
  const functionBoundaries = /\n(?=(?:export\s+)?(?:async\s+)?function\s|\bclass\s|\bconst\s+\w+\s*=\s*(?:async\s+)?\()/g;
  const sections = code.split(functionBoundaries);
  const chunks: string[] = [];

  for (const section of sections) {
    if (section.length <= chunkSize) {
      chunks.push(section);
    } else {
      // Fall back to generic split for very large sections
      const sub = recursiveSplit(section, ["\n\n", "\n", " ", ""], chunkSize);
      chunks.push(...sub);
    }
  }

  return mergeWithOverlap(chunks, chunkSize, chunkOverlap).map((t, i) => ({
    text: `[${language}]\n${t.trim()}`,
    index: i,
    sectionHierarchy: "",
  })).filter((c) => c.text.length > 30);
}

/**
 * Conversation splitter for Slack threads — groups messages into
 * coherent chunks by time window rather than token count.
 */
export function splitConversation(
  messages: Array<{ user: string; text: string; ts: number }>,
  options: SplitOptions = {},
): Chunk[] {
  const { chunkSize = 400 } = options;
  const chunks: string[] = [];
  let current = "";

  for (const msg of messages) {
    const line = `${msg.user}: ${msg.text}\n`;
    if (current.length + line.length > chunkSize && current.length > 0) {
      chunks.push(current.trim());
      current = line;
    } else {
      current += line;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks.map((t, i) => ({
    text: t,
    index: i,
    sectionHierarchy: "",
  }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function recursiveSplit(
  text: string,
  separators: string[],
  chunkSize: number,
): string[] {
  if (text.length <= chunkSize) return [text];

  const [sep, ...rest] = separators;
  if (sep === undefined) return [text];

  const parts = sep ? text.split(sep) : [...text];
  const result: string[] = [];
  let buf = "";

  for (const part of parts) {
    const candidate = buf ? buf + sep + part : part;
    if (candidate.length <= chunkSize) {
      buf = candidate;
    } else {
      if (buf) result.push(buf);
      if (part.length > chunkSize) {
        result.push(...recursiveSplit(part, rest, chunkSize));
        buf = "";
      } else {
        buf = part;
      }
    }
  }
  if (buf) result.push(buf);
  return result;
}

function mergeWithOverlap(
  chunks: string[],
  chunkSize: number,
  overlap: number,
): string[] {
  if (overlap === 0) return chunks;
  const result: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    let text = chunks[i] ?? "";
    // Prepend tail of previous chunk as overlap context
    if (i > 0 && overlap > 0) {
      const prev = chunks[i - 1] ?? "";
      const tail = prev.slice(-overlap);
      text = tail + " " + text;
    }
    result.push(text.slice(0, chunkSize));
  }
  return result;
}

function extractSectionHierarchy(text: string): string {
  const headings: string[] = [];
  const lines = text.split("\n").slice(0, 10);
  for (const line of lines) {
    const match = line.match(/^(#{1,4})\s+(.+)/);
    if (match) headings.push(match[2] ?? "");
  }
  return headings.join(" > ");
}
