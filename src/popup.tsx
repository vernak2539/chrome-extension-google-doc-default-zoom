// Icon used in Favicon was created by https://www.flaticon.com/authors/royyan-wijaya
import { Storage } from "@plasmohq/storage";
import { useState } from "react";
import WorkspaceApplication from "./components/WorkspaceApplication";
import WorkspaceApplicationList from "./components/WorkspaceApplicationList";
import { getFeatureViewOnlyStorageKey, workspaceApps } from "./constants";
import * as styles from "./style.module.css";
import type { StorageKey } from "./types";
import { isChrome, isEdge } from "./utils/get-browser";
import localize from "./utils/localize";
import { setupSentryReactErrorBoundary } from "./utils/sentry/react-error-boundary";

const withSentryErrorBoundary = setupSentryReactErrorBoundary("popup");
const showExtensionVersionsTab = isChrome() || isEdge();

// "extensionName"/"extensionNameExtended" WILL BE CHANGED. DON'T CHANGE WITHOUT MAKING OTHER CHANGES
const extensionName = localize("extensionNameExtended");

type CurrentView = "home" | "settings";

interface SettingsViewProps {
  onHomeClick: () => void;
}

const SettingsView = ({ onHomeClick }: SettingsViewProps) => {
  const storage = new Storage();
  const storageKeys: StorageKey[] = ["zoomValue", "sheets:zoomValue"];

  const onResetZoomSettingsClick = () => {
    const resetProimises = storageKeys.flatMap((key) => {
      return [
        storage.remove(key),
        storage.remove(getFeatureViewOnlyStorageKey(key))
      ];
    });

    Promise.all(resetProimises).then(() => {
      console.log("Extension zoom values + feature keys reset");
    });
  };

  return (
    <div>
      <h2>Settings</h2>

      <section>
        <h3>Reset to Factory Default</h3>
        <p>
          Sometimes things go wrong. If you've tried everything else and
          nothing's working, you can click the button below to reset this
          extension to the state it was in when you first installed it.
        </p>
        <button onClick={onResetZoomSettingsClick}>
          Reset zoom settings to defualt
        </button>
      </section>
      <br />
      <hr />
      <br />
      <button onClick={onHomeClick}>Exit Settings (Go Back)</button>
    </div>
  );
};

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
        </>
      ) : null}
      {isSettingsView ? <SettingsView onHomeClick={openHomeView} /> : null}

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
