import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import AnnouncementComponent from "../components/Announcement/component";

import * as styles from "../style.module.css";

const meta = {
  title: "Announcement",
  component: AnnouncementComponent,
  decorators: [
    (Story) => (
      <div className={styles.popupContainer} style={{ minHeight: "unset" }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof AnnouncementComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

const message =
  "Google has changed something in Docs/Sheets that may stop your default zoom from applying. A fix is being worked on and an update will be published soon.";

export const Info: Story = {
  args: {
    announcement: { id: "info", level: "info", dismissible: true, message },
    onDismiss: fn()
  }
};

export const Warning: Story = {
  args: {
    announcement: { id: "warning", level: "warning", dismissible: true, message },
    onDismiss: fn()
  }
};

export const NotDismissible: Story = {
  args: {
    announcement: { id: "fixed", level: "warning", dismissible: false, message }
  }
};
