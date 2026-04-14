import type { Meta, StoryObj } from "@storybook/react-vite";

import { IndexPopup } from "../popup";

const meta = {
  title: "Popup",
  component: IndexPopup,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof IndexPopup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Settings: Story = {
  render: () => <IndexPopup initialEntries={["/settings"]} />
};
