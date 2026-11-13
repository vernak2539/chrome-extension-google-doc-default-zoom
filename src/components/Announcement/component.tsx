import classnames from "classnames";
import type { Announcement } from "src/utils/announcement";
import localize from "src/utils/localize";

import * as styles from "../../style.module.css";

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
    {/* Rendered as text, never HTML: the message comes from a remote file */}
    <p className={styles.announcementMessage}>{announcement.message}</p>
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
