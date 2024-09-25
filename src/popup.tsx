// Icon used in Favicon was created by https://www.flaticon.com/authors/royyan-wijaya
import WorkspaceApplication from "./components/WorkspaceApplication";
import WorkspaceApplicationList from "./components/WorkspaceApplicationList";
import { workspaceApps } from "./constants";
import * as styles from "./style.module.css";
import { isChrome, isEdge } from "./utils/get-browser";
import localize from "./utils/localize";
import { setupSentryReactErrorBoundary } from "./utils/sentry/react-error-boundary";

const withSentryErrorBoundary = setupSentryReactErrorBoundary("popup");
const showExtensionVersionsTab = isChrome() || isEdge();

// "extensionName"/"extensionNameExtended" WILL BE CHANGED. DON'T CHANGE WITHOUT MAKING OTHER CHANGES
const extensionName = localize("extensionNameExtended");

function IndexPopup() {
  return (
    <div className={styles.popupContainer}>
      <h2>{extensionName}</h2>
      <p>{localize("popupMainSectionDescription")}</p>
      <WorkspaceApplicationList>
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
