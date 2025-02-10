import type { ExtensionFileSource } from "src/types";
import type { ILogObj, Logger as LoggerType } from "tslog";
import * as tslog from "tslog/dist/esm/index.js";

const { Logger } = tslog;

const PREFIX = "[Default Zoom GW]";

class BrowserLogger {
  contexts: [string, string][];
  logger: LoggerType<ILogObj>;

  constructor(source: ExtensionFileSource) {
    this.contexts = [["initiator", source]];
    this.logger = new Logger({
      prefix: [PREFIX],
      hideLogPositionForProduction: true
    });
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
  }

  public error(error: Error) {
    this.logger.error(error);
  }
}

export default BrowserLogger;
