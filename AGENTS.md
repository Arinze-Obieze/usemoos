<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.


---

# usemoos — Agent Rules & Development Guidelines

**Read this entire file before writing a single line of code.**
This is the authoritative source of truth for how this codebase is structured, styled, and built.

---

## 1. What This Project Is

usemoos is an AI-powered organizational knowledge platform. It centralizes fragmented company
knowledge across Slack, Notion, Google Drive, GitHub, Jira, and 250+ other tools into a single
workspace where employees can search and converse with their organization's knowledge in natural
language. It is a multi-tenant B2B SaaS product.

**This repo is the Turborepo monorepo root.** It contains the Next.js frontend (`apps/web/`),
the Hono API server (`apps/api/`), and shared packages. The RAG pipeline, sync workers, and
database schema will live here as well when those layers are built out.

---

## 2. Full System Architecture

The platform is organized as a Turborepo monorepo with three independently deployed services and
shared packages. Understanding this is critical because it defines what belongs in this repo and
what does not.

```
apps/
  web/      ← YOU ARE HERE. Next.js frontend. Marketing site + product workspace UI.
  api/      ← Hono API server. All business logic, RAG pipeline, integrations, auth middleware.
  workers/  ← BullMQ sync workers. Document ingestion, chunking, embedding, indexing.

packages/
  types/    ← Shared TypeScript interfaces and enums used by all three apps.
  db/       ← Drizzle ORM schema and typed query helpers for PostgreSQL.
  adapters/ ← One TypeScript adapter per integration (Slack, Notion, GitHub, etc.).
  lib/      ← Shared pure utilities. No framework dependencies.
```

### What this means in practice

- **The backend is Hono.** It runs as a separate Node.js service on AWS ECS Fargate. All REST
  endpoints, streaming AI responses, OAuth callbacks, webhook receivers, integration sync APIs,
  and any route that involves database queries or external services live there — not here.
- **This repo does not own the database.** Drizzle schema lives in `packages/db`. This frontend
  calls the Hono API over HTTP; it does not connect to PostgreSQL directly.
- **Do not add Next.js Route Handlers** to `apps/web/app/api/`. The Hono API in `apps/api/` is
  the backend. Route Handlers are not a template to follow — the existing `app/api/waitlist/`
  handler is a legacy stub that should be removed once the API is deployed.

---

## 3. Frontend Tech Stack

These are the packages used in this repo. Do not install alternatives.

| Package | Purpose |
|---|---|
| `next` | App Router, React Server Components, streaming |
| `typescript` | Strict type safety |
| `tailwindcss` (v4) | Utility-first styling with `@theme` token wiring |
| `shadcn/ui` | Accessible UI primitives for the product app only — NOT marketing |
| `ai` (Vercel AI SDK) | Streaming AI response hooks and UI for the workspace |
| `@clerk/nextjs` | Auth UI and workspace session management |
| `@tanstack/react-query` | Client-side data fetching, caching, background refetch |
| `zustand` | Lightweight client state (UI state, non-server data) |

---

## 3b. Backend Tech Stack (`apps/api/`)

These are the packages used in the Hono API. Do not install alternatives.

| Package | Purpose |
|---|---|
| `hono` | Core API framework — TypeScript-native, lightweight, streaming support |
| `@hono/node-server` | Node.js HTTP adapter for Hono |
| `@hono/zod-validator` | Request validation middleware using Zod schemas |
| `zod` | Schema validation and type inference |
| `tsx` | TypeScript execution for `dev` mode (watch mode) |

---

## 4. Folder Structure

```
apps/
  web/                  Next.js frontend — marketing site and product workspace UI.
    app/
      (marketing)/      Public marketing pages. No auth required.
        page.tsx        Thin orchestrator — imports and composes section components only.
        layout.tsx
      (app)/            Authenticated product workspace. Clerk middleware applies here.
        layout.tsx      Wraps with Clerk auth + workspace context provider.
        (workspace)/
          page.tsx      Main search/conversation interface.
          integrations/
            page.tsx
          settings/
            page.tsx
        (admin)/
          page.tsx
      (auth)/           Clerk sign-in and sign-up pages.
      api/              Legacy Next.js Route Handler (waitlist stub). Do not add more.
      globals.css       Single source of truth for ALL design tokens.
      layout.tsx        Root layout with font variables and metadata.
    components/
      marketing/        Marketing-only components. No shadcn/ui. Custom design system only.
      ui/               shadcn/ui base components. Used by (app) only. Never by marketing.
      app/              Product workspace components: search, citations, conversation, etc.
      shared/           Components used by both marketing and app. Keep this rare.
    lib/                Frontend-only utilities (formatting, hooks, query functions).

  api/                  Hono API server — all business logic, RAG, integrations, auth.
    src/
      index.ts          App entry point. Registers routes and starts the server.
      routes/           One file per domain (waitlist.ts, search.ts, integrations.ts, …).

packages/
  types/                Shared TypeScript interfaces and enums. Import as @usemoos/types.
  db/                   Drizzle ORM schema and typed query helpers. Import as @usemoos/db.
```

### Naming conventions

- **Folders**: `kebab-case` — `integrations/`, `app/search/`
- **Component files**: `PascalCase` — `SearchBar.tsx`, `CitationCard.tsx`
- **Utility/hook files**: `camelCase` — `useWorkspace.ts`, `formatDate.ts`
- **CSS Modules**: match the component name — `Hero.module.css`, `Features.module.css`

### Page files are orchestrators only

A `page.tsx` file composes components. It does not contain inline JSX markup. If a page file
exceeds ~60 lines, something that belongs in a component is living in the page.

```tsx
// CORRECT — thin orchestrator
export default function WorkspacePage() {
  return (
    <>
      <SearchBar />
      <ConversationThread />
      <CitationPanel />
    </>
  );
}

// WRONG — markup living directly in the page
export default function WorkspacePage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <input className="..." placeholder="Ask anything..." />
      {/* 80 more lines */}
    </div>
  );
}
```

---

## 5. Calling the Hono API

The Hono API (`apps/api/`) is the backend. This frontend communicates with it over HTTP.

**From Server Components** — call the Hono API directly server-side using `fetch` with the
internal service URL from environment variables. Do not go through a Next.js Route Handler
as a middleman just to reach Hono.

```tsx
// CORRECT — Server Component calls Hono directly
export default async function SearchPage() {
  const results = await fetch(`${process.env.API_URL}/search?q=...`, {
    headers: { Authorization: `Bearer ${await getToken()}` },
  }).then(r => r.json());
  return <ResultsList results={results} />;
}
```

**From Client Components** — use TanStack Query to fetch from the Hono API. Do not use raw
`fetch` inside `useEffect`.

```tsx
// CORRECT — Client Component uses TanStack Query
"use client";
function SearchResults({ query }: { query: string }) {
  const { data } = useQuery({
    queryKey: ["search", query],
    queryFn: () => fetch(`/api-proxy/search?q=${query}`).then(r => r.json()),
  });
}
```

**For AI streaming** — use the Vercel AI SDK's `useChat` hook. The stream comes from the Hono
API. Wrap streamed UI in `<Suspense>` with a skeleton fallback.

**Mutations** — use TanStack Query's `useMutation` or Server Actions depending on whether the
action originates from a client or server component.

**Never `fetch("/api/...")` from a Server Component** — that loops through the Next.js server
needlessly. Call the Hono API URL directly.

---

## 6. Styling System

This section is the most important for UI work. Read all of it.

### globals.css is the single source of truth

All design tokens live in `app/globals.css`. No exceptions.

- `@theme` block wires tokens into Tailwind v4 utility classes
- `:root` block provides short aliases for CSS Modules (`var(--ink)`, `var(--bg)`, etc.)
- `@layer components` holds shared layout primitives used across all components
- `@layer utilities` holds global keyframes and animation helpers

**Never hardcode a color, shadow, radius, or font value in any component file.**
Define the token in `globals.css` first, then reference it as a Tailwind utility or CSS variable.

```tsx
// WRONG
<div className="bg-[#0f1108] text-[#fbfaf6]">

// CORRECT
<div className="bg-ink text-bg">
```

```css
/* WRONG — value hardcoded in component */
.card { background: #ffffff; }

/* CORRECT — value from token */
.card { background: var(--surface); }
```

### Available design tokens

**Colors** (use as `bg-*`, `text-*`, `border-*`):
`ink`, `ink-2`, `bg`, `bg-2`, `surface`, `surface-2`, `line`, `line-2`, `muted`, `dim`,
`accent`, `accent-2`, `accent-ink`, `danger`, `warning`

**Radius**: `rounded-sm` (6px) · `rounded` (10px) · `rounded-lg` (16px) · `rounded-xl` (24px)

**Typography**: `font-sans` · `font-mono`

**Shadows** (CSS variables only): `var(--shadow-sm)` · `var(--shadow-md)` · `var(--shadow-lg)` · `var(--shadow-xl)`
Use in Tailwind as: `shadow-[var(--shadow-md)]`

### Shared layout primitives — use these, do not recreate them

Defined in `@layer components` in `globals.css`. Use as plain class strings in JSX:

| Class | What it does |
|---|---|
| `.wrap` | Max-width container with responsive horizontal padding |
| `.sec` | Section vertical padding — 110px → 80px → 60px responsive |
| `.sec-head` | Section header block with max-width constraint |
| `.sec-tag` | Mono uppercase tag with accent-ink color and leading line |
| `.sec-title` | Responsive heading using `clamp(34px, 4.2vw, 54px)` |
| `.sec-sub` | Body copy style for section subtitles |
| `.em-underline` | Inline accent gradient highlight |
| `.em-badge` | Inline solid accent background highlight |
| `.btn` `.btn-primary` `.btn-ghost` `.btn-outline` `.btn-lg` | Button variants |

### Decision tree: where to write styles

Work through these in order:

**1. New design value (color, shadow, radius, font)?**
→ Add it to `globals.css @theme` AND `:root`. Then reference as a Tailwind utility or CSS var.

**2. Shared primitive used in 3+ components?**
→ Add it to `globals.css @layer components`. Not in any component file.

**3. Marketing component — no JS-driven state?**
→ Tailwind utilities in JSX className. Do not create a CSS Module.

**4. Marketing component — needs JS-driven class toggling, IntersectionObserver animation,
complex keyframes referencing DOM structure, or max-height accordion transitions?**
→ Create `ComponentName.module.css`. Only rules that cannot be expressed in Tailwind belong there.

**5. Product app component (`app/(app)/`)?**
→ Tailwind utilities in JSX. Use shadcn/ui components from `components/ui/` for complex
interactive primitives. No new CSS Module files.

**Never create a CSS Module for layout or spacing.** If your module only contains `display`,
`flex`, `gap`, `padding`, or `margin` — stop. That belongs in Tailwind JSX.

### Responsive breakpoints

Use only these. Do not introduce `sm:`, `md:`, `lg:`:

- `max-[900px]:` — tablet and below
- `max-[600px]:` — mobile
- `max-[440px]:` — small mobile

### shadcn/ui is for the product app only

`components/ui/` contains shadcn/ui components. They are copied source files you own and can edit.
When adding one, immediately restyle it to use project tokens:
- Replace shadcn/ui CSS variables with project variables (`--background` → `var(--bg)`)
- Replace hardcoded colors with token utilities (`bg-zinc-900` → `bg-ink`)
- Do not change the Radix UI accessibility structure

The marketing site (`app/(marketing)/`, `components/marketing/`) must never import from
`components/ui/`, shadcn/ui, or Radix UI.

---

## 7. Component Design

### When to extract a component

Extract into its own file when ANY of the following is true:

- The same markup pattern appears in **3 or more places**
- A component file exceeds **~120 lines of JSX**
- A block of JSX has a distinct, nameable responsibility
- A sub-component needs its own state, refs, or effects

Do not extract for the sake of it. Two similar blocks are fine. Three are not.

### Sub-components for DRY within a single file

When a pattern repeats inside one file but nowhere else, define a typed sub-component at the
top of that same file — not in a new file.

```tsx
// Defined at top of Footer.tsx — used only in Footer
function LinkColumn({ title, links }: LinkColumnProps) { ... }

export default function Footer() {
  return (
    <>
      <LinkColumn title="Product" links={productLinks} />
      <LinkColumn title="Company" links={companyLinks} />
    </>
  );
}
```

### Data arrays belong above the component

When rendering a list, define the data as a constant above the component — not inline in JSX.

```tsx
const navItems = [
  { href: "#benefits", label: "Benefits" },
  { href: "#product", label: "Product" },
];

export default function Navbar() {
  return <nav>{navItems.map(item => ...)}</nav>;
}
```

### One file, one purpose

A file should be fully described by its name. Do not combine unrelated concerns:
- Page files do not contain business logic or data fetching — that goes in query functions or
  Server Component children
- Component files do not define Route Handlers
- Form components do not contain the page layout wrapping them
- Data tables do not contain the filter sidebar

---

## 8. React and Next.js Patterns

### Default to React Server Components

Every component is a Server Component unless it needs to be a Client Component. Add `"use client"`
only when the component requires:

- React hooks (`useState`, `useEffect`, `useRef`, `useReducer`, etc.)
- Browser APIs (`window`, `document`, `localStorage`)
- Event handlers that need to be interactive
- Third-party libraries that are client-only

Push `"use client"` as deep into the component tree as possible. Never add it to a page or layout
file just because one child needs it — extract that child into its own Client Component.

```tsx
// WRONG — entire page becomes client because one piece needs interactivity
"use client";
export default function WorkspacePage() {
  const [query, setQuery] = useState("");
  return (
    <>
      <PageHeader />       {/* forced client — didn't need to be */}
      <SearchInput ... />
      <ResultsList />      {/* forced client — didn't need to be */}
    </>
  );
}

// CORRECT — only SearchInput.tsx has "use client"
export default function WorkspacePage() {
  return (
    <>
      <PageHeader />
      <SearchInput />    {/* Client Component in its own file */}
      <ResultsList />
    </>
  );
}
```

### State management

- **Server state** (data from the API): TanStack Query in Client Components, direct `fetch` in
  Server Components
- **Client UI state** (open/closed, selected tab, form input): `useState` or Zustand for state
  that spans multiple components
- **Form mutations**: Server Actions (from Server or Client Components) or TanStack Query's
  `useMutation` for client-driven mutations

### Streaming

Wrap streamed AI responses in `<Suspense>` with meaningful skeleton fallbacks. Use the Vercel AI
SDK `useChat` hook. The stream endpoint lives in the Hono API — the frontend consumes it.

---

## 9. TypeScript

### Strict mode is on — respect it

`"strict": true` is set in `tsconfig.json`. Never use `any`. Use `unknown` when the type is
genuinely unclear, then narrow it.

### Props interfaces

Define prop types as `interface` directly above the component. Use `interface` not `type` for
component props — better error messages.

```tsx
interface CitationCardProps {
  sourceTitle: string;
  sourceTier: 1 | 2 | 3 | 4;
  excerpt: string;
  url: string;
}

export default function CitationCard({ sourceTitle, sourceTier, excerpt, url }: CitationCardProps) {
```

### No type assertions to escape errors

Do not use `as SomeType` to silence TypeScript. Fix the underlying mismatch. The only acceptable
use is genuinely known narrowing (e.g. `ref.current as HTMLInputElement`).

### Shared types

Any type used in multiple packages or apps belongs in `packages/types`. When the monorepo is
assembled, import from `@usemoos/types`. Do not duplicate type definitions.

---

## 10. Authentication and Multi-Tenancy

**This is a multi-tenant platform. Every piece of data belongs to a workspace.**

### Clerk

- Use `@clerk/nextjs` for all auth UI and session management
- Authenticated routes live under `app/(app)/` and are protected by Clerk middleware
- Access the current user and org via `auth()` in Server Components, `useAuth()` in Client
  Components
- Never build custom auth flows. Use Clerk's provided components and hooks.

### workspace_id

When the product app makes API calls to Hono, every request must carry the current workspace
context. Hono enforces `workspace_id` scoping on every database query. From the frontend side,
this means:
- Always pass workspace context in API request headers or the request body
- Never render data that is not scoped to the current workspace

### Permission-aware UI

The Hono API enforces permission filtering before returning results — employees only see content
they already have access to at the source. The frontend must not attempt to reimplement or
work around this filtering.

---

## 11. Code Quality Rules

### No comments explaining what the code does

Write a comment only when the WHY is non-obvious: a hidden constraint, a known bug workaround,
a subtle invariant. Never: `// map items`, `// return result`, `// fetch data`.

### No premature abstraction

Three similar lines are better than a helper written "just in case." Extract only when there is
genuine, proven repetition across 3+ places and the abstraction has a clear, nameable purpose.

### No half-finished code

No `TODO` comments, no placeholder logic, no `console.log` in committed code. Either implement
it fully or do not implement it yet.

### No unnecessary packages

Before installing anything, check whether native Web APIs, Node built-ins, or already-installed
packages solve the problem. Install only with a clear, specific reason.

### Error handling at boundaries only

Validate at system boundaries: incoming data from the Hono API, user form inputs. Do not
defensively wrap internal functions that cannot fail.

### Environment variables

All secrets in environment variables. Never commit secret values. In Server Components, Route
Handlers, and Server Actions, access via `process.env.VARIABLE_NAME`. Never expose secrets
to the browser — if a variable does not have the `NEXT_PUBLIC_` prefix it is server-only.

---

## 12. Specific Patterns — Follow These

- Marketing components use `.sec`, `.wrap`, `.sec-tag`, `.sec-title`, `.sec-sub` directly in
  JSX as string class names — they are global primitives, not module classes.
- Use `group/name` Tailwind named groups for parent-driven child styles (FAQ accordion,
  hover-triggered child color changes).
- Use `[transition:property_duration]` arbitrary Tailwind syntax for multi-property transitions
  with different durations per property.
- For CSS Module components, the `cx(styles, ...classNames)` utility in `styleUtils.ts` resolves
  module-scoped classes but falls back to global class names — shared primitives like `.wrap` and
  `.btn` resolve automatically without needing to be in the module.
- Mobile menus and overlays: use `opacity-0 pointer-events-none` for the closed state.
  Do NOT use the `hidden` HTML attribute — it breaks CSS transitions.
- Use `focus-within:` on form wrapper elements for container-level focus ring styling, not
  `focus:` on individual inputs.

## 13. Things to Never Do

- Do not add Next.js Route Handlers (`app/api/`) for endpoints that belong in the Hono API.
  This frontend calls Hono. It does not duplicate Hono.
- Do not create CSS Module files for components that can be fully expressed in Tailwind JSX.
- Do not use shadcn/ui or Radix UI components in the marketing site.
- Do not hardcode hex color values, shadow values, or radius values in component files.
  All values flow through `globals.css @theme` first.
- Do not add `clsx`, `cn`, or `classnames` packages. The existing `cx()` in
  `components/marketing/styleUtils.ts` handles CSS Module resolution.
- Do not turn a Server Component into a Client Component just to pass data down as props —
  fetch data in the child Server Component directly, or pass only serializable props.
- Do not use `any` types.
- Do not make API calls without the current workspace context attached.
- Do not duplicate type definitions that belong in `packages/types`.

<!-- END:nextjs-agent-rules -->