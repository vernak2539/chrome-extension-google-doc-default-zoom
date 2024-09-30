// Icon used in Favicon was created by https://www.flaticon.com/authors/royyan-wijaya
import { useState } from "react";
import SettingsView from "src/areas/settings";
import WorkspaceApplication from "src/components/WorkspaceApplication";
import WorkspaceApplicationList from "src/components/WorkspaceApplicationList";
import { workspaceApps } from "src/constants";
import * as styles from "src/style.module.css";
import type { CurrentView } from "src/types";
import { isChrome, isEdge } from "src/utils/get-browser";
import localize from "src/utils/localize";
import { setupSentryReactErrorBoundary } from "src/utils/sentry/react-error-boundary";

const withSentryErrorBoundary = setupSentryReactErrorBoundary("popup");
const showExtensionVersionsTab = isChrome() || isEdge();

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
        <>
          <p>{localize("popupMainSectionDescription")}</p>
          <WorkspaceApplicationList onSettingsClick={openSettingsView}>
            {workspaceApps
              .filter((app) => app.isEnabled)
              .map((app) => (
                <WorkspaceApplication
                  key={app.name}
                  name={app.name}
                  zoomValues={app.zoomValues}
                  defaultZoom={app.defaultZoom}
                  storageKey={app.storageKey}
                  features={app.features}
                />
              ))}
          </WorkspaceApplicationList>
          {showExtensionVersionsTab && (
            <p>
              <a
                href="#"
                onClick={() => {
                  chrome.tabs.create({
                    url: "./tabs/ext-versions.html"
                  });
                }}>
                <small>{localize("popupToExtensionVersionsTab")}</small>
              </a>
            </p>
          )}
        </>
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
