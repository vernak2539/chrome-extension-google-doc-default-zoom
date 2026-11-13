import { Storage } from "@plasmohq/storage";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  DISMISSED_ANNOUNCEMENT_STORAGE_KEY,
  fetchAnnouncement,
  resolveAnnouncement,
  type Announcement
} from "src/utils/announcement";
import { LoggerContext } from "src/utils/logger/context";

// Dismissal is a per-device UI preference, so keep it out of synced settings
const storage = new Storage({ area: "local" });

const getUiLocale = () => chrome?.i18n?.getUILanguage?.() ?? "en";
const getExtensionVersion = () => chrome?.runtime?.getManifest?.().version ?? "0.0.0";

export const useAnnouncement = () => {
  const logger = useContext(LoggerContext);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const [remote, dismissedId] = await Promise.all([
          fetchAnnouncement(),
          storage.get<string>(DISMISSED_ANNOUNCEMENT_STORAGE_KEY)
        ]);

        if (isMounted) {
          setAnnouncement(
            resolveAnnouncement(remote, {
              uiLocale: getUiLocale(),
              extensionVersion: getExtensionVersion(),
              dismissedId
            })
          );
        }
      } catch (error) {
        // Offline, blocked, timed out, or malformed JSON. Not worth reporting to Sentry,
        // the popup simply renders without an announcement.
        logger.info(`Unable to load announcement: ${error}`);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [logger]);

  const dismiss = useCallback(() => {
    if (!announcement) return;
    setAnnouncement(null);
    storage.set(DISMISSED_ANNOUNCEMENT_STORAGE_KEY, announcement.id).catch((error) => {
      logger.error("Unable to save dismissed announcement", error);
    });
  }, [announcement, logger]);

  return { announcement, dismiss };
};
