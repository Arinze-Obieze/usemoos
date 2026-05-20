interface IconProps {
  name: string;
  size?: number;
}

const s = { stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

export default function WorkspaceIcon({ name, size = 16 }: IconProps) {
  const d = size;
  switch (name) {
    case "home":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="M2.5 7.5 8 3l5.5 4.5V13a.5.5 0 0 1-.5.5h-3v-4h-4v4h-3a.5.5 0 0 1-.5-.5V7.5Z" /></svg>;
    case "ask":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h7A1.5 1.5 0 0 1 13 4.5v5A1.5 1.5 0 0 1 11.5 11H7l-3 2.5V11a1 1 0 0 1-1-1v-5.5Z" /></svg>;
    case "library":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="M3 3v10M5.5 3v10M9 3.5l3.5 1-2 9.5-3.5-1 2-9.5Z" /></svg>;
    case "sources":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="M2.5 4.5a5.5 2 0 0 0 11 0 5.5 2 0 0 0-11 0Zm0 0v7a5.5 2 0 0 0 11 0v-7M2.5 8a5.5 2 0 0 0 11 0" /></svg>;
    case "search":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></svg>;
    case "pin":
      return <svg width={d} height={d} viewBox="0 0 16 16" fill="currentColor"><path d="M9.5 1.5 14 6l-2 .8-3.4 3.4L8 13l-1.2.1-2.5-2.5L4.4 9.4l3-3.4L8 3.5l1.5-2Z" /></svg>;
    case "send":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="M2.5 8H13M9 4l4 4-4 4" /></svg>;
    case "plus":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="M8 3v10M3 8h10" /></svg>;
    case "chev-d":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="m4 6 4 4 4-4" /></svg>;
    case "chev-r":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="m6 4 4 4-4 4" /></svg>;
    case "chev-l":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="m10 4-4 4 4 4" /></svg>;
    case "sidebar":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><rect x="1.5" y="2" width="13" height="12" rx="1.5" /><path d="M5.5 2v12" /></svg>;
    case "panel-r":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><rect x="1.5" y="2" width="13" height="12" rx="1.5" /><path d="M10.5 2v12" /></svg>;
    case "close":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="m4 4 8 8M12 4l-8 8" /></svg>;
    case "check":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="m3.5 8.5 3 3 6-7" /></svg>;
    case "bell":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="M8 2.5a3.5 3.5 0 0 0-3.5 3.5v2L3 10h10l-1.5-2V6A3.5 3.5 0 0 0 8 2.5ZM6.5 12.5a1.5 1.5 0 0 0 3 0" /></svg>;
    case "settings":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><circle cx="8" cy="8" r="2" /><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" /></svg>;
    case "copy":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><rect x="5" y="5" width="8" height="8" rx="1.5" /><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-5A1.5 1.5 0 0 0 3 3.5v6A1.5 1.5 0 0 0 4.5 11H5" /></svg>;
    case "share":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><circle cx="4" cy="8" r="1.5" /><circle cx="12" cy="4" r="1.5" /><circle cx="12" cy="12" r="1.5" /><path d="m5.5 7 5-2.5M5.5 9l5 2.5" /></svg>;
    case "thumb-u":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="M5.5 13.5h6L13 8.5c.2-.7-.3-1.5-1-1.5h-2.5l.7-3a1 1 0 0 0-1-1.2L8.5 3l-3 4.5v6Zm0 0V7" /></svg>;
    case "refresh":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="M2.5 8a5.5 5.5 0 0 1 9.5-3.8m0 0V2m0 2.2H10M13.5 8a5.5 5.5 0 0 1-9.5 3.8m0 0V14m0-2.2H6" /></svg>;
    case "filter":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="M2.5 4h11M5 8h6M7 12h2" /></svg>;
    case "lock":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><rect x="3" y="7" width="10" height="6.5" rx="1" /><path d="M5 7V5a3 3 0 0 1 6 0v2" /></svg>;
    case "sparkle":
      return <svg width={d} height={d} viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5 9 6l4.5 1L9 8l-1 4.5L7 8l-4.5-1L7 6l1-4.5Z" /></svg>;
    case "file":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="M4 2.5h5l3 3V13a.5.5 0 0 1-.5.5h-7A.5.5 0 0 1 4 13V2.5ZM9 2.5v3h3" /></svg>;
    case "link":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="M6 10a2.5 2.5 0 0 1 0-3.5l2-2a2.5 2.5 0 0 1 3.5 3.5l-1 1M10 6a2.5 2.5 0 0 1 0 3.5l-2 2a2.5 2.5 0 0 1-3.5-3.5l1-1" /></svg>;
    case "att":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="M11.5 7 7 11.5a2.5 2.5 0 0 1-3.5-3.5l5-5a1.5 1.5 0 0 1 2.5 2L6 10" /></svg>;
    case "arrow-tl":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="m4 12 8-8M4 4h8v8" /></svg>;
    case "more":
      return <svg width={d} height={d} viewBox="0 0 16 16" fill="currentColor"><circle cx="4" cy="8" r="1.2" /><circle cx="8" cy="8" r="1.2" /><circle cx="12" cy="8" r="1.2" /></svg>;
    case "warn":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="M8 3 14 13H2L8 3ZM8 7v3M8 12v.5" /></svg>;
    case "globe":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><circle cx="8" cy="8" r="5.5" /><path d="M2.5 8h11M8 2.5c2 2 2 9 0 11M8 2.5c-2 2-2 9 0 11" /></svg>;
    case "shield":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><path d="M8 2 3 4v4c0 3 2.5 5 5 6 2.5-1 5-3 5-6V4L8 2Z" /></svg>;
    case "user":
      return <svg width={d} height={d} viewBox="0 0 16 16" {...s}><circle cx="8" cy="6" r="2.5" /><path d="M3 13.5c.5-2.2 2.5-3.5 5-3.5s4.5 1.3 5 3.5" /></svg>;
    default:
      return null;
  }
}
