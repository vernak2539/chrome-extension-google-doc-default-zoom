import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import WorkspaceApplication from "../components/WorkspaceApplication/component";
import WorkspaceApplicationList from "../components/WorkspaceApplicationList";
import {
  DOCS_DEFAULT_ZOOM,
  DOCS_ZOOM_VALUES,
  SHEETS_DEFAULT_ZOOM,
  SHEETS_ZOOM_VALUES
} from "../constants";

import styles from "../style.module.css";

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
    app: {
      name: "Docs",
      zoomValues: DOCS_ZOOM_VALUES,
      features: {
        customZoomInput: false,
        enableViewOnlyToggle: false,
        classroomSupport: false
      }
    },
    settings: {
      zoomValue: DOCS_DEFAULT_ZOOM,
      viewOnly: false,
      classroomSupport: false
    },
    onChange: fn()
  }
};

export const GoogleDocsCustomZoom: Story = {
  args: {
    app: {
      name: "Docs",
      zoomValues: DOCS_ZOOM_VALUES,
      features: {
        customZoomInput: true,
        enableViewOnlyToggle: false,
        classroomSupport: false
      }
    },
    settings: {
      zoomValue: "123%",
      viewOnly: false,
      classroomSupport: false
    },
    onChange: fn()
  }
};

export const GoogleDocsViewOnly: Story = {
  args: {
    app: {
      name: "Docs",
      zoomValues: DOCS_ZOOM_VALUES,
      features: {
        customZoomInput: false,
        enableViewOnlyToggle: true,
        classroomSupport: false
      }
    },
    settings: {
      zoomValue: "100%",
      viewOnly: true,
      classroomSupport: false
    },
    onChange: fn()
  }
};

export const GoogleSheets: Story = {
  args: {
    app: {
      name: "Sheets",
      zoomValues: SHEETS_ZOOM_VALUES,
      features: {
        customZoomInput: false,
        enableViewOnlyToggle: false,
        classroomSupport: false
      }
    },
    settings: {
      zoomValue: SHEETS_DEFAULT_ZOOM,
      viewOnly: false,
      classroomSupport: false
    },
    onChange: fn()
  }
};

export const GoogleSheetsCustomZoom: Story = {
  args: {
    app: {
      name: "Sheets",
      zoomValues: SHEETS_ZOOM_VALUES,
      features: {
        customZoomInput: true,
        enableViewOnlyToggle: false,
        classroomSupport: false
      }
    },
    settings: {
      zoomValue: "123%",
      viewOnly: false,
      classroomSupport: false
    },
    onChange: fn()
  }
};
