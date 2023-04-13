// Icon used in Favicon was created by https://www.flaticon.com/authors/royyan-wijaya
import WorkspaceApplication from "~components/WorkspaceApplication"
import WorkspaceApplicationList from "~components/WorkspaceApplicationList"
import { setupSentry } from "~utils/sentry-popup"
import workspaceApps from "~workspace-apps"

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
    <div style={{ minWidth: "310px" }}>
      <h2>{chrome.i18n.getMessage("extensionName")}</h2>
      <ErrorBoundary
        fallback={<ErrorFallback />}
        beforeCapture={(scope) => {
          scope.setTag("locale", chrome.i18n.getUILanguage())
        }}>
        <p>{chrome.i18n.getMessage("popupMainSectionDescription")}</p>
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
              />
            ))}
        </WorkspaceApplicationList>
      </ErrorBoundary>
    </div>
  )
}

export default IndexPopup
