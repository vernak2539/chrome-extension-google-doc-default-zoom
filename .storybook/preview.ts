import type { Preview } from "@storybook/react-vite";
import englishMessages from "../locales/en/messages.json";

window.chrome = window.chrome || {};
window.chrome.i18n = window.chrome.i18n || {};
window.chrome.i18n.getMessage = (key: string) => {
  return englishMessages[key]?.message || key;
};

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
