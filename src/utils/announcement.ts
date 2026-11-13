// Remote announcements let the maintainer show a message in the popup without publishing a new
// extension version (e.g. "Google changed something, a fix is on the way").
// The source file lives in this repo at `announcements/announcement.json` and is served from
// the default branch via raw.githubusercontent.com, which allows CORS from any origin, so no
// extra host permissions are required. See docs/announcements.md for the file format.

export const ANNOUNCEMENT_URL =
  "https://raw.githubusercontent.com/vernak2539/chrome-extension-google-doc-default-zoom/main/announcements/announcement.json";

export const DISMISSED_ANNOUNCEMENT_STORAGE_KEY = "dismissedAnnouncementId";

const DEFAULT_LOCALE = "en";
const FETCH_TIMEOUT_MS = 5000;

export type AnnouncementLevel = "info" | "warning";

export interface RemoteAnnouncement {
  id: string;
  active: boolean;
  level?: AnnouncementLevel;
  dismissible?: boolean;
  // Only show to installed versions <= maxVersion (inclusive). Useful for hiding a
  // "fix is coming" message from users who already have the fix.
  maxVersion?: string;
  // Locale code (e.g. "en", "de", "pt_BR") -> message. "en" is required.
  messages: Record<string, string>;
}

export interface Announcement {
  id: string;
  level: AnnouncementLevel;
  dismissible: boolean;
  message: string;
}

const isRecordOfStrings = (value: unknown): value is Record<string, string> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((v) => typeof v === "string");

// The remote file is outside of the extension's control, so validate everything before use
export const parseAnnouncement = (data: unknown): RemoteAnnouncement | null => {
  if (typeof data !== "object" || data === null) {
    return null;
  }

  const { id, active, level, dismissible, maxVersion, messages } = data as Record<string, unknown>;

  if (typeof id !== "string" || id.length === 0) return null;
  if (typeof active !== "boolean") return null;
  if (level !== undefined && level !== "info" && level !== "warning") return null;
  if (dismissible !== undefined && typeof dismissible !== "boolean") return null;
  if (maxVersion !== undefined && typeof maxVersion !== "string") return null;
  if (!isRecordOfStrings(messages) || !messages[DEFAULT_LOCALE]) return null;

  return { id, active, level, dismissible, maxVersion, messages };
};

// Normalises "pt-BR" / "pt_br" to "pt_BR" to match the locales/ folder naming
const normaliseLocale = (locale: string) => {
  const [language, region] = locale.replace("-", "_").split("_");
  return region ? `${language.toLowerCase()}_${region.toUpperCase()}` : language.toLowerCase();
};

export const pickLocalizedMessage = (messages: Record<string, string>, uiLocale: string) => {
  const normalisedMessages = Object.fromEntries(
    Object.entries(messages).map(([locale, message]) => [normaliseLocale(locale), message])
  );
  const locale = normaliseLocale(uiLocale || DEFAULT_LOCALE);
  const language = locale.split("_")[0];

  return normalisedMessages[locale] || normalisedMessages[language] || messages[DEFAULT_LOCALE];
};

// Compares dotted numeric versions ("0.15.3"). Returns <0, 0 or >0.
export const compareVersions = (a: string, b: string) => {
  const aParts = a.split(".").map((part) => parseInt(part, 10) || 0);
  const bParts = b.split(".").map((part) => parseInt(part, 10) || 0);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const diff = (aParts[i] ?? 0) - (bParts[i] ?? 0);
    if (diff !== 0) return diff;
  }

  return 0;
};

interface ResolveOptions {
  uiLocale: string;
  extensionVersion: string;
  dismissedId?: string | null;
}

// Decides whether, and what, to show the user
export const resolveAnnouncement = (
  remote: RemoteAnnouncement | null,
  { uiLocale, extensionVersion, dismissedId }: ResolveOptions
): Announcement | null => {
  if (!remote || !remote.active) return null;
  if (remote.maxVersion && compareVersions(extensionVersion, remote.maxVersion) > 0) return null;

  const dismissible = remote.dismissible ?? true;
  if (dismissible && dismissedId === remote.id) return null;

  return {
    id: remote.id,
    level: remote.level ?? "info",
    dismissible,
    message: pickLocalizedMessage(remote.messages, uiLocale)
  };
};

export const fetchAnnouncement = async (
  url: string = ANNOUNCEMENT_URL
): Promise<RemoteAnnouncement | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    // Credentials are never needed and would only leak cookies to GitHub
    const response = await fetch(url, {
      signal: controller.signal,
      credentials: "omit",
      cache: "no-cache"
    });
    if (!response.ok) return null;
    return parseAnnouncement(await response.json());
  } finally {
    clearTimeout(timeout);
  }
};
