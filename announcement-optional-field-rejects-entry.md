---
topic: announcements
source_issue: 169
---

In `parseAnnouncement` (`src/utils/announcement.ts`), an invalid optional field (`level`, `dismissible`, `maxVersion`, `editions`, `link`) returns `null` for the whole entry. It does not drop only the field. `parseAnnouncements` then skips that entry and keeps the others. `link` is `{ url, text }`: `url` must parse as `https:`, `text` is a locale map with a non-empty `en`, and only those two keys are copied.
