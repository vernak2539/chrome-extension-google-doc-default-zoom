import AnnouncementComponent from "./component";
import { useAnnouncement } from "./hooks";

const Announcement = () => {
  const { announcement, dismiss } = useAnnouncement();

  if (!announcement) {
    return null;
  }

  return <AnnouncementComponent announcement={announcement} onDismiss={dismiss} />;
};

export default Announcement;
