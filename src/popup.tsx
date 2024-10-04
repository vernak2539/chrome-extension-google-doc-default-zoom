// Icon used in Favicon was created by https://www.flaticon.com/authors/royyan-wijaya
import { useState } from "react";
import HomeView from "src/areas/home";
import SettingsView from "src/areas/settings";
import * as styles from "src/style.module.css";
import type { CurrentView } from "src/types";
import { isChrome, isEdge } from "src/utils/get-browser";
import localize from "src/utils/localize";
import { setupSentryReactErrorBoundary } from "src/utils/sentry/react-error-boundary";

const showExtensionVersionsTab = isChrome() || isEdge();
const withSentryErrorBoundary = setupSentryReactErrorBoundary("popup");

// "extensionName"/"extensionNameExtended" WILL BE CHANGED. DON'T CHANGE WITHOUT MAKING OTHER CHANGES
const extensionName = localize("extensionNameExtended");

function IndexPopup() {
  const [currentView, setCurrentView] = useState<CurrentView>("home");

  const isSettingsView = currentView === "settings";
  const isHomeView = currentView === "home";

  const openSettingsView = () => {
    setCurrentView("settings");
  };

  const openHomeView = () => {
    setCurrentView("home");
  };

  return (
    <div className={styles.popupContainer}>
      <h1>{extensionName}</h1>
      {isHomeView ? (
        <HomeView
          openSettingsView={openSettingsView}
          showExtensionVersionsTab={showExtensionVersionsTab}
        />
      ) : null}
      {isSettingsView ? <SettingsView onHomeClick={openHomeView} /> : null}

      <p className={styles.supportMeLinkContainer}>
        <small>
          💚{" "}
          <a href="https://buymeacoffee.com/vernacchia">
            {localize("popupSupportMeLabel")}
          </a>{" "}
          🤟
        </small>
      </p>
    </div>
  );
}

export default withSentryErrorBoundary(IndexPopup, extensionName);
