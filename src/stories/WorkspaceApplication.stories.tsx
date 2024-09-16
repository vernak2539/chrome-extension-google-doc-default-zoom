import type { Meta, StoryObj } from "@storybook/react";

import WorkspaceApplication from "../components/WorkspaceApplication/component";
import WorkspaceApplicationList from "../components/WorkspaceApplicationList";
import {
  DOCS_DEFAULT_ZOOM,
  DOCS_ZOOM_VALUES,
  SHEETS_DEFAULT_ZOOM,
  SHEETS_ZOOM_VALUES
} from "../constants";
import * as styles from "../style.module.css";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "WorkspaceApplication",
  component: WorkspaceApplication,
  tags: ["autodocs"],
  decorators: [
    (StoryPartial) => {
      return (
        <div style={{ maxWidth: "500px" }} className={styles.popupContainer}>
          <WorkspaceApplicationList>
            <StoryPartial />
          </WorkspaceApplicationList>
        </div>
      );
    }
  ]
} satisfies Meta<typeof WorkspaceApplication>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const GoogleDocs: Story = {
  args: {
    applicationName: "Docs",
    isCustomZoomLevel: false,
    updateZoomLevel: () => {},
    zoomLevel: DOCS_DEFAULT_ZOOM,
    zoomLevelCustom: "",
    zoomValues: DOCS_ZOOM_VALUES,
    features: {
      customZoomInput: false,
      enableViewOnlyToggle: false
    },
    featureDocsViewOnlyEnabled: false
  }
};

export const GoogleDocsCustomZoom: Story = {
  args: {
    applicationName: "Docs",
    isCustomZoomLevel: true,
    updateZoomLevel: () => {},
    zoomLevel: "",
    zoomLevelCustom: "123%",
    zoomValues: DOCS_ZOOM_VALUES,
    features: {
      customZoomInput: true,
      enableViewOnlyToggle: false
    },
    featureDocsViewOnlyEnabled: false
  }
};

export const GoogleDocsViewOnly: Story = {
  args: {
    applicationName: "Docs",
    isCustomZoomLevel: false,
    updateZoomLevel: () => {},
    zoomLevel: "100%",
    zoomLevelCustom: "",
    zoomValues: DOCS_ZOOM_VALUES,
    features: {
      customZoomInput: false,
      enableViewOnlyToggle: true
    },
    featureDocsViewOnlyEnabled: true
  }
};

export const GoogleSheets: Story = {
  args: {
    applicationName: "Sheets",
    isCustomZoomLevel: false,
    updateZoomLevel: () => {},
    zoomLevel: SHEETS_DEFAULT_ZOOM,
    zoomLevelCustom: "",
    zoomValues: SHEETS_ZOOM_VALUES,
    features: {
      customZoomInput: false,
      enableViewOnlyToggle: false
    },
    featureDocsViewOnlyEnabled: false
  }
};

export const GoogleSheetsCustomZoom: Story = {
  args: {
    applicationName: "Sheets",
    isCustomZoomLevel: true,
    updateZoomLevel: () => {},
    zoomLevel: "",
    zoomLevelCustom: "123%",
    zoomValues: SHEETS_ZOOM_VALUES,
    features: {
      customZoomInput: true,
      enableViewOnlyToggle: false
    },
    featureDocsViewOnlyEnabled: false
  }
};
