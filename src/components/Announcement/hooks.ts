import { useCallback, useContext, useEffect, useState } from "react";
import {
  DISMISSED_ANNOUNCEMENTS_STORAGE_KEY,
  fetchAnnouncements,
  resolveAnnouncements,
  type Announcement
} from "src/utils/announcement";
import { EDITION } from "src/utils/edition";
import { LoggerContext } from "src/utils/logger/context";
import { readStoredValue } from "src/utils/storage";
import { storage } from "wxt/utils/storage";

const getUiLocale = () => chrome?.i18n?.getUILanguage?.() ?? "en";
const getExtensionVersion = () => chrome?.runtime?.getManifest?.().version ?? "0.0.0";

const getDismissedIds = async () => {
  const stored = await readStoredValue<string[]>(DISMISSED_ANNOUNCEMENTS_STORAGE_KEY);
  return Array.isArray(stored) ? stored : [];
};

export const useAnnouncements = () => {
  const logger = useContext(LoggerContext);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const [remote, dismissedIds] = await Promise.all([fetchAnnouncements(), getDismissedIds()]);

        if (isMounted) {
          setAnnouncements(
            resolveAnnouncements(remote, {
              uiLocale: getUiLocale(),
              extensionVersion: getExtensionVersion(),
              edition: EDITION,
              dismissedIds
            })
          );
        }
      } catch (error) {
        // Offline, blocked, timed out, or malformed JSON. Not worth reporting to Sentry,
        // the popup simply renders without announcements.
        logger.info(`Unable to load announcements: ${error}`);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [logger]);

  const dismiss = useCallback(
    async (id: string) => {
      setAnnouncements((current) => current.filter((announcement) => announcement.id !== id));

      try {
        const dismissedIds = await getDismissedIds();
        if (!dismissedIds.includes(id)) {
          await storage.setItem(DISMISSED_ANNOUNCEMENTS_STORAGE_KEY, [...dismissedIds, id]);
        }
      } catch (error) {
        logger.error("Unable to save dismissed announcement", error);
      }
    },
    [logger]
  );

  return { announcements, dismiss };
};
