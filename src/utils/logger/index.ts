import type { ExtensionFileSource } from "src/types";
import type { ILogObj, Logger as LoggerType } from "tslog";
import * as tslog from "tslog/dist/esm/index.js";

const { Logger } = tslog;

const PREFIX = "[Default Zoom GW] ";

class BrowserLogger {
  contexts: [string, string][];
  logger: LoggerType<ILogObj>;

  constructor(source: ExtensionFileSource) {
    this.contexts = [["initiator", source]];
    this.logger = new Logger({
      prefix: [PREFIX],
      hideLogPositionForProduction: true
    });

    this.info("test");
  }

  public addContext(key: string, value: string) {
    this.contexts.push([key, value]);
  }

  public info(message: string) {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    const context = this.contexts.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

    this.logger.info(message, context);

    // console.log(
    //   `%c${PREFIX}%c${message} - %c${JSON.stringify(context, null, 2)}`,
    //   "color: blue;font-weight: bold;",
    //   "color: green;",
    //   "color: red;"
    // );
  }

  public error(error: Error) {
    this.logger.error(error);
  }
}

export default BrowserLogger;
