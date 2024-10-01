import type { StorybookConfig } from "@storybook/react-vite";
import svgr from "vite-plugin-svgr";

import path from "path";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-console",
    "@storybook/addon-a11y"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  docs: {},
  async viteFinal(config) {
    // Merge custom configuration into the default config
    const { mergeConfig } = await import("vite");

    return mergeConfig(config, {
      plugins: [svgr()],
      resolve: {
        alias: {
          src: path.resolve(process.cwd(), "src"),
          "react:~": path.resolve(process.cwd())
        }
      }
    });
  }
};

export default config;
