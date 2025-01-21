import type { ExtensionFileSource } from "src/types";
import { createLogger, format, transports, type Logger } from "winston";
const { combine, timestamp, label } = format;

class BrowserLogger {
  logger: Logger;
  contexts: [string, string][];

  constructor(source: ExtensionFileSource) {
    this.contexts = [["Source", source]];
    this.logger = createLogger(this.getOptions());
  }

  private getOptions() {
    return {
      level: "info",
      format: this.format(),
      transports: [new transports.Console()]
    };
  }

  private format() {
    const labels = this.contexts.reduce((acc, [key, value]) => {
      acc.push(label({ label: `${key}=${value}` }));
      return acc;
    }, []);

    return combine(timestamp(), ...labels);
  }

  public addContext(key: string, value: string) {
    this.contexts.push([key, value]);
    this.logger.configure(this.getOptions());
  }

  public log(message: string) {
    const context = this.contexts.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

    this.logger.info(message, context);
  }
}

export default BrowserLogger;
