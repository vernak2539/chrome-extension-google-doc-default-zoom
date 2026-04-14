// Icon used in Favicon was created by https://www.flaticon.com/authors/royyan-wijaya

import "@picocss/pico/css/pico.min.css";
import localize from "src/utils/localize";
import { setupSentryReactErrorBoundary } from "src/utils/sentry/react-error-boundary";

import { AppRouter } from "./router";
import { LoggerProvider } from "./utils/logger/context";

import * as styles from "src/style.module.css";

const withSentryErrorBoundary = setupSentryReactErrorBoundary("popup");

// "extensionName"/"extensionNameExtended" WILL BE CHANGED. DON'T CHANGE WITHOUT MAKING OTHER CHANGES
const extensionName = localize("extensionNameExtended");

export function IndexPopup() {
  return (
    <LoggerProvider>
      <main className={`container ${styles.popupContainer}`}>
        <h1>{extensionName}</h1>

        <AppRouter />

        <p className={styles.supportMeLinkContainer}>
          <small>
            💚{" "}
            <a target="_blank" href="https://buymeacoffee.com/vernacchia">
              {localize("popupSupportMeLabel")}
            </a>{" "}
            🤟
          </small>
        </p>
      </main>
    </LoggerProvider>
  );
}

export default withSentryErrorBoundary(IndexPopup, extensionName);
