---
topic: logging
source_issue: 108
---

`src/utils/logger/index.ts` `BrowserLogger` is a plain `console` wrapper with the prefix `[Default Zoom GW]`; `info` is silent when `NODE_ENV` is production, `error(message, error)` always logs. tslog is no longer a dependency in package.json, so notes about tslog deep-import failures under jsdom or Storybook are out of date.
