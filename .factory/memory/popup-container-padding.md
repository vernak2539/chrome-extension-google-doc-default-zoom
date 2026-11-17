---
topic: Popup layout (Pico)
---

`src/popup.tsx` renders `<main className="container ${styles.popupContainer}">` with the h1 as first child. Pico v2 `.container` pads only left/right with `var(--pico-spacing)`. Pico's vertical padding applies only to `body > main`, and Plasmo mounts React inside `#__plasmo`, so the popup gets no vertical padding from Pico. `.popupContainer` in `src/style.module.css` therefore sets `padding-top: var(--pico-spacing)`. The class is also used by `src/components/ErrorFallback/index.tsx` and the stories `src/stories/Announcement.stories.tsx` and `src/stories/WorkspaceApplication.stories.tsx`. Heading sizes come from `.popupContainer h1/h2/h3` in the same file (h1 is 1.5rem).
