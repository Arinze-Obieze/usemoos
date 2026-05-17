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
import styles from "./Marketing.module.css";
import { cx } from "./styleUtils";

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
    <section className={cx(styles, "int-section sec")} id="integrations">
      <div className={cx(styles, "wrap")}>
        <div className={cx(styles, "sec-head centered")}>
          <div className={cx(styles, "sec-tag")}>Integrations</div>
          <h2 className={cx(styles, "sec-title")}>
            Connect once. <em>Everything&apos;s in scope</em>.
          </h2>
          <p className={cx(styles, "sec-sub")}>
            Native, two-way integrations with the systems your team already
            trusts. New connectors ship every month based on customer demand.
          </p>
        </div>
        <div className={cx(styles, "int-grid")}>
          {integrations.map((int) => {
            const Icon = int.icon;
            return (
              <div key={int.name} className={cx(styles, "int")}>
                <div
                  className={cx(styles, "int-ico")}
                  style={{ background: int.bg }}
                >
                  <Icon />
                </div>
                <div className={cx(styles, "nm")}>{int.name}</div>
              </div>
            );
          })}
          <div className={cx(styles, "int more")}>+ 18 more</div>
        </div>
      </div>
    </section>
  );
}
