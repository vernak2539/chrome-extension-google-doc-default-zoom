import type { StorybookConfig } from "@storybook/react-vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

import path from "path";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
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
      plugins: [
        react(),
        svgr({
          include: ["**/*.svg?react", "react:~**/*.svg", "**/*.svg"]
        })
      ],
      resolve: {
        alias: {
          src: path.resolve(process.cwd(), "src"),
          "react:~": path.resolve(process.cwd())
        }
      }
    });
  },

  typescript: {
    reactDocgen: "react-docgen-typescript"
  }
};

export default config;
