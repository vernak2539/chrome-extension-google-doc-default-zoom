import type { Meta, StoryObj } from "@storybook/react"

import WorkspaceApplication from "../components/WorkspaceApplication"
import WorkspaceApplicationList from "../components/WorkspaceApplicationList"
import {
  DOCS_DEFAULT_ZOOM,
  DOCS_STORAGE_KEY,
  DOCS_ZOOM_VALUES,
  SHEETS_DEFAULT_ZOOM,
  SHEETS_STORAGE_KEY,
  SHEETS_ZOOM_VALUES
} from "../constants"
import * as styles from "../style.module.css"

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "WorkspaceApplication",
  component: WorkspaceApplication,
  tags: ["autodocs"],
  decorators: [
    (StoryPartial) => {
      return (
        <div style={{ maxWidth: "300px" }} className={styles.popupContainer}>
          <WorkspaceApplicationList>
            <StoryPartial />
          </WorkspaceApplicationList>
        </div>
      )
    }
  ]
} satisfies Meta<typeof WorkspaceApplication>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const GoogleDocs: Story = {
  args: {
    name: "Docs",
    zoomValues: DOCS_ZOOM_VALUES,
    defaultZoom: DOCS_DEFAULT_ZOOM,
    storageKey: DOCS_STORAGE_KEY,
    features: {
      customZoomInput: false,
      enableViewOnlyToggle: false
    }
  }
}

export const GoogleSheets: Story = {
  args: {
    name: "Sheets",
    zoomValues: SHEETS_ZOOM_VALUES,
    defaultZoom: SHEETS_DEFAULT_ZOOM,
    storageKey: SHEETS_STORAGE_KEY,
    features: {
      customZoomInput: false,
      enableViewOnlyToggle: false
    }
  }
}
