import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  DOCS_DEFAULT_ZOOM,
  DOCS_ZOOM_VALUES,
  SHEETS_ZOOM_VALUES
} from "src/constants";
import WorkspaceApplication from "../components/WorkspaceApplication/new-component";
import * as styles from "../style.module.css";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "NewWorkspaceApplication",
  component: WorkspaceApplication,
  tags: ["autodocs"],
  decorators: [
    (StoryPartial) => {
      return (
        <div style={{ maxWidth: "500px" }} className={styles.popupContainer}>
          <StoryPartial />
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
      enableViewOnlyToggle: false,
      classroomSupport: false
    },
    featureDocsViewOnlyEnabled: false,
    updateDocsViewOnly: () => {},
    featureClassroomSupportEnabled: false,
    updateClassroomSupport: () => {}
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
      enableViewOnlyToggle: false,
      classroomSupport: false
    },
    featureDocsViewOnlyEnabled: false,
    updateDocsViewOnly: () => {},
    featureClassroomSupportEnabled: false,
    updateClassroomSupport: () => {}
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
      enableViewOnlyToggle: true,
      classroomSupport: false
    },
    featureDocsViewOnlyEnabled: true,
    updateDocsViewOnly: () => {},
    featureClassroomSupportEnabled: false,
    updateClassroomSupport: () => {}
  }
};

export const GoogleDocsClassroomSupport: Story = {
  args: {
    applicationName: "Docs",
    isCustomZoomLevel: false,
    updateZoomLevel: () => {},
    zoomLevel: DOCS_DEFAULT_ZOOM,
    zoomLevelCustom: "",
    zoomValues: DOCS_ZOOM_VALUES,
    features: {
      customZoomInput: false,
      enableViewOnlyToggle: false,
      classroomSupport: true
    },
    featureDocsViewOnlyEnabled: false,
    updateDocsViewOnly: () => {},
    featureClassroomSupportEnabled: false,
    updateClassroomSupport: () => {}
  }
};

export const GoogleDocsAllExperimentalOptions: Story = {
  args: {
    applicationName: "Docs",
    isCustomZoomLevel: false,
    updateZoomLevel: () => {},
    zoomLevel: DOCS_DEFAULT_ZOOM,
    zoomLevelCustom: "",
    zoomValues: DOCS_ZOOM_VALUES,
    features: {
      customZoomInput: false,
      enableViewOnlyToggle: true,
      classroomSupport: true
    },
    featureDocsViewOnlyEnabled: false,
    updateDocsViewOnly: () => {},
    featureClassroomSupportEnabled: false,
    updateClassroomSupport: () => {}
  }
};

export const GoogleSheets: Story = {
  args: {
    applicationName: "Sheets",
    isCustomZoomLevel: false,
    updateZoomLevel: () => {},
    zoomLevel: DOCS_DEFAULT_ZOOM,
    zoomLevelCustom: "",
    zoomValues: DOCS_ZOOM_VALUES,
    features: {
      customZoomInput: false,
      enableViewOnlyToggle: false,
      classroomSupport: false
    },
    featureDocsViewOnlyEnabled: false,
    updateDocsViewOnly: () => {},
    featureClassroomSupportEnabled: false,
    updateClassroomSupport: () => {}
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
      enableViewOnlyToggle: false,
      classroomSupport: false
    },
    featureDocsViewOnlyEnabled: false,
    updateDocsViewOnly: () => {},
    featureClassroomSupportEnabled: false,
    updateClassroomSupport: () => {}
  }
};
