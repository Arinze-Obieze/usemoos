import { BsMicrosoft, BsMicrosoftTeams } from "react-icons/bs";
import {
  FaConfluence,
  FaDropbox,
  FaGithub,
  FaGoogleDrive,
  FaJira,
  FaSlack,
  FaTrello,
} from "react-icons/fa";
import {
  SiAsana,
  SiHubspot,
  SiLinear,
  SiNotion,
  SiSalesforce,
  SiZendesk,
} from "react-icons/si";

const integrations = [
  { bg: "#4A154B", icon: FaSlack, name: "Slack" },
  { bg: "#0F1108", icon: SiNotion, name: "Notion" },
  { bg: "#1FA463", icon: FaGoogleDrive, name: "Drive" },
  { bg: "#161B22", icon: FaGithub, name: "GitHub" },
  { bg: "#0052CC", icon: FaJira, name: "Jira" },
  { bg: "#172B4D", icon: FaConfluence, name: "Confluence" },
  { bg: "#5E6AD2", icon: SiLinear, name: "Linear" },
  { bg: "#FF7A59", icon: SiHubspot, name: "HubSpot" },
  { bg: "#00A1E0", icon: SiSalesforce, name: "Salesforce" },
  { bg: "#03363D", icon: SiZendesk, name: "Zendesk" },
  { bg: "#4B53BC", icon: BsMicrosoftTeams, name: "Teams" },
  { bg: "#0061FF", icon: FaDropbox, name: "Dropbox" },
  { bg: "#0F1108", icon: BsMicrosoft, name: "SharePoint" },
  { bg: "#026AA7", icon: FaTrello, name: "Trello" },
  { bg: "#F06A6A", icon: SiAsana, name: "Asana" },
];

export default function Integrations() {
  return (
    <section
      className="sec bg-surface border-t border-b border-line"
      id="integrations"
    >
      <div className="wrap">
        <div className="sec-head centered">
          <div className="sec-tag">Integrations</div>
          <h2 className="sec-title">
            Connect once.{" "}
            <em className="em-underline">Everything&apos;s in scope</em>.
          </h2>
          <p className="sec-sub">
            Native, two-way integrations with the systems your team already
            trusts. New connectors ship every month based on customer demand.
          </p>
        </div>
        <div className="grid grid-cols-8 gap-[10px] max-[900px]:grid-cols-4 max-[600px]:grid-cols-3 max-[600px]:gap-2 max-[440px]:grid-cols-3">
          {integrations.map((int) => {
            const Icon = int.icon;
            return (
              <div
                key={int.name}
                className="aspect-square bg-surface border border-line rounded-[12px] flex flex-col items-center justify-center gap-2 transition-[border-color,transform,box-shadow] duration-[180ms] hover:border-line-2 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] max-[600px]:rounded-[10px] max-[600px]:gap-[6px] max-[440px]:aspect-[1.05]"
              >
                <div
                  className="w-8 h-8 rounded-[7px] grid place-items-center font-bold text-[13px] text-white max-[600px]:w-7 max-[600px]:h-7 max-[600px]:text-[12px]"
                  style={{ background: int.bg }}
                >
                  <Icon className="text-[16px] max-[600px]:text-[14px]" />
                </div>
                <div className="text-[12px] text-ink-2 font-medium max-[600px]:text-[11px]">
                  {int.name}
                </div>
              </div>
            );
          })}
          <div className="aspect-square bg-transparent border border-dashed border-line rounded-[12px] flex flex-col items-center justify-center text-muted font-mono text-[13px] max-[600px]:rounded-[10px] max-[440px]:aspect-[1.05]">
            + 18 more
          </div>
        </div>
      </div>
    </section>
  );
}
