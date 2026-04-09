import type { Preview } from "@storybook/react-vite";

import "./chrome-mock";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    }
  },

  tags: ["autodocs"]
};

export default preview;
