import type { ExtensionFileSource } from "src/types";

const PREFIX = "Default Zoom GW - ";

class BrowserLogger {
  contexts: [string, string][];

  constructor(source: ExtensionFileSource) {
    this.contexts = [["Source", source]];
  }

  public addContext(key: string, value: string) {
    this.contexts.push([key, value]);
  }

  public info(message: string) {
    const context = this.contexts.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

    console.log(
      `%c${PREFIX}%c${message} - %c${JSON.stringify(context, null, 2)}`,
      "color: blue;font-weight: bold;",
      "color: green;",
      "color: red;"
    );
  }
}

export default BrowserLogger;
