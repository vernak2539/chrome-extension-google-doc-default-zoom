# Announcements

The popup can show a short message (e.g. "Google changed something, an update is coming") without publishing a new extension version.

Each time the popup opens it fetches [`announcements/announcement.json`](../announcements/announcement.json) from the `main` branch:

```
https://raw.githubusercontent.com/vernak2539/chrome-extension-google-doc-default-zoom/main/announcements/announcement.json
```

To publish, change the file and merge it to `main`. GitHub's raw CDN caches for up to ~5 minutes, so it may take that long to reach users. If the request fails (offline, timeout, invalid JSON) the popup renders without a message.

## File format

```json
{
  "id": "2026-11-google-ui-change",
  "active": true,
  "level": "warning",
  "dismissible": true,
  "maxVersion": "0.15.3",
  "messages": {
    "en": "English text (required)",
    "de": "..."
  }
}
```

| Field         | Required | Description                                                                                                                                   |
| ------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | yes      | Unique ID. Dismissals are stored against this, so **use a new ID for a new message** or users who dismissed the previous one won't see it.    |
| `active`      | yes      | `false` hides the message without deleting it.                                                                                                |
| `level`       | no       | `"info"` (default) or `"warning"`. Changes the border colour.                                                                                 |
| `dismissible` | no       | Defaults to `true`. When `true`, users can close the message and won't see that `id` again on this device.                                    |
| `maxVersion`  | no       | Only show to installed versions less than or equal to this. Set it to the last broken version so users who already have the fix don't see it. |
| `messages`    | yes      | Locale code → plain text. `en` is required. Line breaks (`\n`) are kept; HTML is not rendered.                                                |

## Languages

Provide a message for every locale in [`bin/translate-config.mjs`](../bin/translate-config.mjs) plus `en`. The popup picks the browser UI language, falling back from region (`pt_BR`) to language (`pt`) to `en`. Machine (or LLM) translation is fine; see [localization.md](./localization.md).
