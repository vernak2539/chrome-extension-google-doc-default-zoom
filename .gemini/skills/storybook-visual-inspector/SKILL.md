---
name: storybook-visual-inspector
description: Visual feedback loop for UI/CSS changes in Storybook. Use this skill whenever you modify React components, styles, or the overall layout of the extension's popup to autonomously verify your changes against the user's requirements and ensure visual consistency.
---

# Storybook Visual Inspector

This skill provides an autonomous visual feedback loop for Gemini CLI. It allows the agent to "see" its changes in real-time using a local Storybook server.

## Prerequisites

1.  **Storybook Server:** Ensure the Storybook development server is running locally (default: `http://localhost:6006`).
    - **Check if running:** Use `lsof -i :6006` or a similar tool.
    - **Start if needed:** If not running, start it in the background using the command from `package.json` (e.g., `pnpm storybook`) with `is_background: true`.
    - **Wait for ready:** After starting, wait a few seconds (e.g., using `sleep 5` or the `pause` utility) to ensure the server is ready before attempting to capture.
2.  **Playwright:** The project should have `playwright` installed (handled during skill setup).

## Visual Verification Workflow

Whenever you make a change to a UI-related file (e.g., `src/**/*.tsx`, `src/**/*.module.css`), follow these steps:

### 1. Capture the UI

Run the bundled capture script using the `run_shell_command` tool. This will generate a high-quality screenshot of the "Popup" story.

```bash
node .gemini/skills/storybook-visual-inspector/scripts/capture.mjs
```

_Note: The script saves the screenshot to `docs/preview.png`._

### 2. Inspect the Result

Use the `read_file` tool to view the generated screenshot. Since you are a multimodal model, you can analyze the visual output.

```bash
read_file(file_path="docs/preview.png")
```

### 3. Verify and Iterate

- **Alignment:** Check if elements are properly aligned.
- **Styling:** Verify colors, fonts, and spacing.
- **Requirements:** Ensure the change matches what the user requested.
- **Regressions:** Check for any accidental changes to surrounding elements.

If the visual result does not meet the requirements, modify the code and repeat the capture/inspect cycle until the UI is correct.

## Troubleshooting

- **Server Not Found:** If the script fails to navigate, double-check that Storybook is running.
- **Selector Timeout:** If the script fails to find the selector, it might be due to a loading state or a change in the root class name. Check the console output of the capture script.
