import type { Event } from "@sentry/browser";

const REDACTED = "[redacted]";
const APP_SEGMENTS = ["document", "spreadsheets"];

/**
 * Reduces a page address to what is safe to send to Sentry.
 *
 * Docs/Sheets addresses carry the document ID (the access key for link-shared files) in several
 * shapes, so instead of matching the ID we keep only the origin and the app segment.
 * Query string and fragment are always dropped.
 */
export const redactUrl = (href: string): string => {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return REDACTED;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    // extension pages (popup, tabs) carry no document data; the path shows which page failed.
    // Firefox's moz-extension:// host is a per-install UUID, so it is not sent.
    const host = url.protocol === "moz-extension:" ? REDACTED : url.host;
    return `${url.protocol}//${host}${url.pathname}`;
  }

  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return `${url.protocol}//${url.host}/`;
  }

  const app = segments.find((segment) => APP_SEGMENTS.includes(segment));
  return `${url.protocol}//${url.host}/${app ? `${app}/` : ""}${REDACTED}`;
};

/**
 * Rebuilds `event.request` as an allow-list (redacted url + headers without the referrer), so no
 * query string, cookies or body can leak through.
 */
export const redactEventRequest = <T extends Event>(event: T): T => {
  if (!event.request) {
    return event;
  }

  const headers = Object.fromEntries(
    Object.entries(event.request.headers ?? {}).filter(([name]) => name.toLowerCase() !== "referer")
  );

  event.request = {
    ...(event.request.url !== undefined && { url: redactUrl(event.request.url) }),
    headers
  };

  return event;
};
