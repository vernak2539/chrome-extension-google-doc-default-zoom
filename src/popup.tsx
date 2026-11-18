// Icon used in Favicon was created by https://www.flaticon.com/authors/royyan-wijaya

import "@picocss/pico/css/pico.min.css";
import Announcement from "src/components/Announcement";
import { IS_EXTENDED_EDITION } from "src/utils/edition";
import localize from "src/utils/localize";
import { setupSentryReactErrorBoundary } from "src/utils/sentry/react-error-boundary";

import { AppRouter } from "./router";
import { LoggerProvider } from "./utils/logger/context";

import * as styles from "src/style.module.css";

const withSentryErrorBoundary = setupSentryReactErrorBoundary("popup");

const extensionName = localize(IS_EXTENDED_EDITION ? "extensionNameExtended" : "extensionName");

export function IndexPopup() {
  return (
    <LoggerProvider>
      <main className={`container ${styles.popupContainer}`}>
        <h1>{extensionName}</h1>

        <Announcement />

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
