import {
  FaConfluence,
  FaGithub,
  FaGoogleDrive,
  FaJira,
  FaSlack,
} from "react-icons/fa";
import { SiNotion } from "react-icons/si";
import styles from "./Marketing.module.css";
import { cx } from "./styleUtils";

export default function LogosBand() {
  const tools = [
    { name: "Slack", icon: FaSlack },
    { name: "Notion", icon: SiNotion },
    { name: "Drive", icon: FaGoogleDrive },
    { name: "GitHub", icon: FaGithub },
    { name: "Jira", icon: FaJira },
    { name: "Confluence", icon: FaConfluence },
  ];

  return (
    <section className={cx(styles, "wrap")}>
      <div className={cx(styles, "logos")}>
        <div className={cx(styles, "logos-label")}>
          Built for the tools your team already lives in
        </div>
        <div className={cx(styles, "logos-marquee")}>
          <div className={cx(styles, "logos-row")}>
            {tools.map((t) => (
              <div key={t.name} className={cx(styles, "l")}>
                <t.icon className={cx(styles, "icon")} />
                {t.name}
              </div>
            ))}
          </div>
          <div className={cx(styles, "logos-row")} aria-hidden="true">
            {tools.map((t) => (
              <div key={t.name} className={cx(styles, "l")}>
                <t.icon className={cx(styles, "icon")} />
                {t.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
