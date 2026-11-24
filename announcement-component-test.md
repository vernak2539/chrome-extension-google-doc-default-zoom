---
topic: testing
source_issue: 169
---

`src/components/Announcement/component.test.tsx` covers the link anchor (`href`, `target="_blank"`, `rel="noopener noreferrer"`) and the no-link case, using the jsdom, `createRoot` and `act` pattern from `src/components/WorkspaceApplication/component.test.tsx` and a mock of `../../utils/localize`. `src/stories/Announcement.stories.tsx` builds `Announcement` objects inline, and `pnpm typecheck` includes stories, so a change to that type needs the stories to still compile.
