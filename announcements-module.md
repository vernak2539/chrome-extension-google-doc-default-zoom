---
topic: announcements
source_issue: 165
---

Remote popup announcements: pure parse/resolve logic in `src/utils/announcement.ts` (`parseAnnouncement`, `parseAnnouncements`, `resolveAnnouncement(s)`, `fetchAnnouncements`), tested in `src/utils/announcement.test.ts` (uses `it`, not `test`). The only production caller is `useAnnouncements` in `src/components/Announcement/hooks.ts`, which passes `edition: EDITION`. An optional `editions` array (`base`/`extended`) scopes an announcement, and omitting it shows in both editions. The file format is documented in `docs/announcements.md`, and the data file is `announcements/announcement.json`, fetched from raw.githubusercontent.com on `main`.
