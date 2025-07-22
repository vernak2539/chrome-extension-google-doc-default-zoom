import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import Button from "../../components/base/Button";

// import * as styles from "../style.module.css";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Button",
  component: Button,
  tags: ["autodocs"]
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
  args: {
    label: "Press Me",
    variant: "primary",
    onPress: fn()
  }
};

export const Disabled: Story = {
  args: {
    label: "Press Me - you can't",
    variant: "primary",
    onPress: fn(),
    isDisabled: true
  }
};

export const Danger: Story = {
  args: {
    label: "Press Me",
    variant: "danger",
    onPress: fn()
  }
};
