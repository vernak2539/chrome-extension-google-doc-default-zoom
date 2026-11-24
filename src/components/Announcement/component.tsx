import classnames from "classnames";
import type { Announcement } from "src/utils/announcement";
import localize from "src/utils/localize";

import styles from "../../style.module.css";

interface Props {
  announcement: Announcement;
  onDismiss?: () => void;
}

const AnnouncementComponent = ({ announcement, onDismiss }: Props) => (
  <div
    role="status"
    className={classnames(styles.announcement, {
      [styles.announcementWarning]: announcement.level === "warning"
    })}>
    {/* Rendered as text, never HTML: the message and link text come from a remote file */}
    {/* dir="auto" keeps an English fallback reading left-to-right inside an RTL popup */}
    <div className={styles.announcementBody}>
      <p className={styles.announcementMessage} dir="auto">
        {announcement.message}
      </p>
      {announcement.link && (
        <a
          href={announcement.link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.announcementLink}
          dir="auto">
          {announcement.link.text}
        </a>
      )}
    </div>
    {announcement.dismissible && onDismiss && (
      <button
        type="button"
        className={styles.announcementDismiss}
        aria-label={localize("popupAnnouncementDismissLabel")}
        title={localize("popupAnnouncementDismissLabel")}
        onClick={onDismiss}>
        ×
      </button>
    )}
  </div>
);

export default AnnouncementComponent;
