// Icon used in Favicon was created by https://www.flaticon.com/authors/royyan-wijaya
import * as Sentry from "@sentry/react"

import WorkspaceApplication from "~components/WorkspaceApplication"
import WorkspaceApplicationList from "~components/WorkspaceApplicationList"
import workspaceApps from "~workspace-apps"

import packageJson from "../package.json"

// todo - build in enabled/disabled state state

Sentry.init({
  dsn: "https://cda13d29c40d43ceb0009522544cc911@o1429321.ingest.sentry.io/4504945222483968",
  integrations: [],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  release: `${packageJson.name}@${packageJson.version}`
})

Sentry.configureScope((scope) => {
  scope.setTags({
    source: "popup"
  })
})

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
      <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
        <h2>{chrome.i18n.getMessage("extensionName")}</h2>
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
      </Sentry.ErrorBoundary>
    </div>
  )
}

export default IndexPopup
