import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { Checkbox } from "../../components/base/Checkbox";

const CheckboxManager = (props) => {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <Checkbox
      {...props}
      isSelected={isSelected}
      onChange={() =>
        setIsSelected((p) => {
          const newVal = !p;
          props.onChange(newVal);
          return newVal;
        })
      }
    />
  );
};

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Checkbox",
  component: CheckboxManager,
  tags: ["autodocs"]
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
  args: {
    isSelected: false,
    onChange: fn(),
    label: "Checkbox"
  }
};
