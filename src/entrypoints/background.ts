import { startBackground } from "src/background";
import { defineBackground } from "wxt/utils/define-background";

export default defineBackground(() => {
  startBackground();
});
