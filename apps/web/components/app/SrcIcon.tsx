import { SOURCES } from "@/components/app/workspaceData";

interface SrcLogoProps {
  src: string;
  size?: number;
}

function SrcLogo({ src, size = 14 }: SrcLogoProps) {
  const s = size;
  switch (src) {
    case "notion":
      return <svg width={s} height={s} viewBox="0 0 16 16"><text x="3" y="12.5" fontFamily="Georgia, serif" fontWeight="700" fontSize="13" fill="currentColor">N</text></svg>;
    case "slack":
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="6.5" width="2" height="6" rx="1" /><rect x="6.5" y="3" width="2" height="6" rx="1" /><rect x="11" y="3.5" width="2" height="6" rx="1" /><rect x="7.5" y="11" width="6" height="2" rx="1" /></svg>;
    case "drive":
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M6 2.5h4l4 7-2 3.5H6l-4-7L6 2.5Zm0 0 4 7H2l4-7Zm4 7h4l-2 3.5L10 9.5Z" /></svg>;
    case "github":
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M8 2.5a5.5 5.5 0 0 0-1.7 10.7c.3 0 .4-.1.4-.3v-1c-1.5.3-1.9-.7-1.9-.7-.3-.7-.7-.9-.7-.9-.5-.4 0-.4 0-.4.6 0 .9.6.9.6.5.9 1.3.6 1.7.5 0-.4.2-.6.4-.8-1.2-.1-2.4-.6-2.4-2.6 0-.6.2-1 .5-1.4 0-.2-.3-.7.1-1.4 0 0 .4-.1 1.4.5a4.8 4.8 0 0 1 2.5 0c1-.6 1.4-.5 1.4-.5.3.7 0 1.2 0 1.4.4.4.5.8.5 1.4 0 2-1.2 2.5-2.4 2.6.2.2.4.5.4 1v1.5c0 .2.1.3.4.3A5.5 5.5 0 0 0 8 2.5Z" /></svg>;
    case "linear":
      return <svg width={s} height={s} viewBox="0 0 16 16"><path d="M3 9.5 6.5 13M3 7l6 6M3 4.5l8.5 8.5M5 3l8 8M8 3a5 5 0 0 1 5 5" stroke="currentColor" strokeWidth="1.4" fill="none" /></svg>;
    case "jira":
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M8 2 3 7l1.5 1.5L8 5l3.5 3.5L13 7 8 2Z" opacity="0.7" /><path d="M8 14 3 9l1.5-1.5L8 11l3.5-3.5L13 9l-5 5Z" /></svg>;
    case "confluence":
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M2 11c2-3 6-3 8 0M14 5c-2 3-6 3-8 0" stroke="currentColor" strokeWidth="2" fill="none" /></svg>;
    case "figma":
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><circle cx="10" cy="8" r="2" /><path d="M6 2h2v4H6a2 2 0 0 1 0-4ZM8 2h2a2 2 0 0 1 0 4H8V2ZM6 6h2v4H6a2 2 0 0 1 0-4ZM6 10h2v2a2 2 0 0 1-2-2Z" /></svg>;
    case "zendesk":
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M3 4h6L3 13V4Zm10 9H7l6-9v9Z" /></svg>;
    case "hubspot":
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="11" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.4" /><circle cx="11" cy="4" r="1" fill="currentColor" /><path d="M11 5v3.5M9 9.5l-3-2" stroke="currentColor" strokeWidth="1.4" /></svg>;
    case "salesforce":
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M4 9a2.5 2.5 0 0 1 4.5-1.5A2.5 2.5 0 0 1 13 9a2 2 0 0 1-1 4H5a2 2 0 0 1-1-4Z" /></svg>;
    case "teams":
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="4" width="7" height="8" rx="1" /><text x="6.5" y="10" fontFamily="Arial" fontWeight="700" fontSize="6" fill="white" textAnchor="middle">T</text><circle cx="12" cy="5" r="1.5" /></svg>;
    case "dropbox":
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="m2.5 5 3-2 2.5 2-3 2-2.5-2Zm5.5 0 2.5-2 3 2-2.5 2L8 5Zm-5 4 3-2 2.5 2-3 2-2.5-2Zm5.5 0 2.5-2 3 2-2.5 2L8 9Z" /></svg>;
    case "asana":
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="4.5" r="1.8" /><circle cx="4" cy="11" r="1.8" /><circle cx="12" cy="11" r="1.8" /></svg>;
    case "clickup":
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m3 11 5-4 5 4M3 7l5-4 5 4" /></svg>;
    case "sharepoint":
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><circle cx="6" cy="7" r="3.5" /><circle cx="11" cy="9" r="2.5" opacity="0.6" /></svg>;
    case "trello":
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><rect x="2.5" y="2.5" width="11" height="11" rx="1.5" /><rect x="4" y="4" width="3" height="7" rx="0.5" fill="white" /><rect x="9" y="4" width="3" height="4" rx="0.5" fill="white" /></svg>;
    default:
      return <svg width={s} height={s} viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="10" rx="2" fill="currentColor" opacity="0.3" /></svg>;
  }
}

interface SrcIconProps {
  src: string;
  size?: number;
}

export default function SrcIcon({ src, size = 14 }: SrcIconProps) {
  const meta = SOURCES[src] ?? { label: src, cls: "" };
  return (
    <span className={`s-ico ${meta.cls} inline-grid place-items-center rounded-[4px]`} style={{ width: size + 4, height: size + 4 }}>
      <SrcLogo src={src} size={size} />
    </span>
  );
}
