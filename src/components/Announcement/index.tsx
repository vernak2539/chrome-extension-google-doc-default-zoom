import AnnouncementComponent from "./component";
import { useAnnouncements } from "./hooks";

import * as styles from "../../style.module.css";

const Announcements = () => {
  const { announcements, dismiss } = useAnnouncements();

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className={styles.announcementList}>
      {announcements.map((announcement) => (
        <AnnouncementComponent
          key={announcement.id}
          announcement={announcement}
          onDismiss={() => dismiss(announcement.id)}
        />
      ))}
    </div>
  );
};

export default Announcements;
