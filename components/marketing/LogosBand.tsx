import {
  FaConfluence,
  FaGithub,
  FaGoogleDrive,
  FaJira,
  FaSlack,
} from "react-icons/fa";
import { SiNotion } from "react-icons/si";

const tools = [
  { name: "Slack", icon: FaSlack },
  { name: "Notion", icon: SiNotion },
  { name: "Drive", icon: FaGoogleDrive },
  { name: "GitHub", icon: FaGithub },
  { name: "Jira", icon: FaJira },
  { name: "Confluence", icon: FaConfluence },
];

function LogoRow({ hidden }: { hidden?: boolean }) {
  return (
    <div
      className="flex gap-7 items-center max-[900px]:gap-[18px] max-[600px]:gap-[14px]"
      aria-hidden={hidden ? "true" : undefined}
    >
      {tools.map((t) => (
        <div
          key={t.name}
          className="h-7 flex items-center gap-2 text-muted font-semibold text-[17px] opacity-65 tracking-[-0.01em] whitespace-nowrap transition-[opacity,color] duration-200 hover:opacity-100 hover:text-ink-2 max-[600px]:text-[15px]"
        >
          <t.icon className="text-[20px]" />
          {t.name}
        </div>
      ))}
    </div>
  );
}

export default function LogosBand() {
  return (
    <section className="wrap">
      <div className="py-[70px] pb-[50px] relative overflow-hidden max-[600px]:py-[56px] max-[600px]:pb-[36px]">
        <div className="text-center font-mono text-[11.5px] text-muted tracking-[0.12em] uppercase mb-[30px] whitespace-nowrap">
          Built for the tools your team already lives in
        </div>
        <div className="flex w-max animate-marquee gap-7 max-[900px]:gap-[18px] max-[600px]:gap-[14px]">
          <LogoRow />
          <LogoRow hidden />
        </div>
      </div>
    </section>
  );
}
