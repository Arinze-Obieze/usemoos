import styles from "./Marketing.module.css";
import { cx } from "./styleUtils";

export default function FounderNote() {
  return (
    <section className={cx(styles, "note-sec")}>
      <div className={cx(styles, "wrap")}>
        <div className={cx(styles, "note")}>
          <div
            className={cx(styles, "sec-tag")}
            style={{ justifyContent: "center", display: "inline-flex" }}
          >
            A note from the team
          </div>
          <p className={cx(styles, "q")}>
            We started usemoos because we kept watching brilliant teams ask the
            same questions twice, miss the doc that already had the answer, and
            lose half a day to a search box.{" "}
            <em>Org knowledge should not be a scavenger hunt.</em>
          </p>
          <div className={cx(styles, "who")}>
            <span className={cx(styles, "av")}>AO</span>
            <span>
              <span className={cx(styles, "name")}>Arinze Obieze</span> ·{" "}
              <span className={cx(styles, "role")}>Founder, usemoos</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
