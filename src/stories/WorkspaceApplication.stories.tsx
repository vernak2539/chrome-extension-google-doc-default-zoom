import type { Meta, StoryObj } from "@storybook/react"

import WorkspaceApplication from "../components/WorkspaceApplication"
import WorkspaceApplicationList from "../components/WorkspaceApplicationList"
import {
  DEFAULT_ZOOM as DOCS_DEFAULT_ZOOM,
  STORAGE_KEY as DOCS_STORAGE_KEY,
  ZOOM_VALUES as DOCS_ZOOM_VALUES
} from "../strategies/docs"
import {
  DEFAULT_ZOOM as SHEETS_DEFAULT_ZOOM,
  STORAGE_KEY as SHEETS_STORAGE_KEY,
  ZOOM_VALUES as SHEETS_ZOOM_VALUES
} from "../strategies/sheets"

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "WorkspaceApplication",
  component: WorkspaceApplication,
  tags: ["autodocs"],
  decorators: [
    (StoryPartial) => (
      <WorkspaceApplicationList>
        <StoryPartial />
      </WorkspaceApplicationList>
    )
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
    storageKey: DOCS_STORAGE_KEY
  }
}

export const GoogleSheets: Story = {
  args: {
    name: "Sheets",
    zoomValues: SHEETS_ZOOM_VALUES,
    defaultZoom: SHEETS_DEFAULT_ZOOM,
    storageKey: SHEETS_STORAGE_KEY
  }
}
