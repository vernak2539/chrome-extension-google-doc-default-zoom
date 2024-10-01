import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import Select from "../components/Select";

// import * as styles from "../style.module.css";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Select",
  component: Select,
  tags: ["autodocs"]
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Dropdown: Story = {
  args: {
    placeholder: "Select",
    initialValue: 4,
    options: [
      { id: 1, value: "Cat" },
      { id: 2, value: "Dog" },
      { id: 3, value: "Other" },
      { id: 4, value: "Fish" },
      { id: 5, value: "Google" },
      { id: 6, value: "Microsoft" }
    ],
    onSelect: fn()
  }
};
