import path from "path";

import type { StorybookConfig } from "@storybook/react-vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],

  addons: ["@storybook/addon-links", "@storybook/addon-a11y", "@storybook/addon-docs"],

  framework: {
    name: "@storybook/react-vite",
    options: {}
  },

  docs: {},

  async viteFinal(config) {
    // Merge custom configuration into the default config
    const { mergeConfig } = await import("vite");

    return mergeConfig(config, {
      define: {
        "import.meta.env.MODE": JSON.stringify("extended"),
        "import.meta.env.BROWSER": JSON.stringify("chrome"),
        "import.meta.env.COMMAND": JSON.stringify("serve"),
        "import.meta.env.WXT_SENTRY_DSN": "undefined"
      },
      plugins: [react(), svgr({ include: ["**/*.svg?react", "**/*.svg"] })],
      resolve: {
        alias: {
          src: path.resolve(process.cwd(), "src")
        }
      }
    });
  },

  typescript: {
    reactDocgen: "react-docgen"
  }
};

export default config;
