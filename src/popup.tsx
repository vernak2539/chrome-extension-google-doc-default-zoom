// Icon used in Favicon was created by https://www.flaticon.com/authors/royyan-wijaya
import WorkspaceApplication from "./components/WorkspaceApplication"
import WorkspaceApplicationList from "./components/WorkspaceApplicationList"
import { workspaceApps } from "./constants"
import * as styles from "./style.module.css"
import localize from "./utils/localize"
import { setupSentry } from "./utils/sentry-popup"

// todo - build in enabled/disabled state state

const ErrorBoundary = setupSentry("popup")

const ErrorFallback = () => (
  <p>
    Sorry! Something has gone wrong. Please submit an issue{" "}
    <a href="https://github.com/vernak2539/chrome-extension-google-doc-default-zoom/issues/new/choose">
      here
    </a>{" "}
    so I can fix it!
  </p>
)

function IndexPopup() {
  return (
    <div className={styles.popupContainer}>
      {/*  "extensionNameExtended" WILL BE REPLACED. DON'T CHANGE WITHOUT MAKING OTHER CHANGES */}
      <h2>{localize("extensionNameExtended")}</h2>
      <ErrorBoundary
        fallback={<ErrorFallback />}
        beforeCapture={(scope) => {
          scope.setTag("locale", chrome.i18n.getUILanguage())
        }}>
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
      </ErrorBoundary>
    </div>
  )
}

export default IndexPopup
