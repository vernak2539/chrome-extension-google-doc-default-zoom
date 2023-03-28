// Icon used in Favicon was created by https://www.flaticon.com/authors/royyan-wijaya
import type { ChangeEvent } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import WorkspaceApplication from "~components/WorkspaceApplication"
import WorkspaceApplicationList from "~components/WorkspaceApplicationList"
import {
  DEFAULT_ZOOM as DOCS_DEFAULT_ZOOM,
  STORAGE_KEY as DOCS_STORAGE_KEY,
  ZOOM_VALUES as DOCS_ZOOM_VALUES
} from "~strategies/docs"
import workspaceApps from "~workspace-apps"

// todo - build in enabled/disabled state state

function IndexPopup() {
  const [defaultZoom, setDefaultZoom] = useStorage(
    DOCS_STORAGE_KEY,
    (storedZoom) => {
      return typeof storedZoom === "undefined" ? DOCS_DEFAULT_ZOOM : storedZoom
    }
  )

  const onDefaultZoomChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value
    setDefaultZoom(newValue)
  }

  return (
    <div style={{ minWidth: "310px" }}>
      <h2>Google Workspace Zoom Default</h2>
      <p>
        Select the default zoom you'd like your Google Workspace applications to
        use when they first load.
      </p>
      <h3 style={{ marginBottom: 0 }}>Applications</h3>
      <WorkspaceApplicationList>
        {workspaceApps
          .filter((app) => app.isEnabled)
          .map((app) => (
            <WorkspaceApplication
              application={app.name}
              values={app.zoomValues}
              selectedValue={defaultZoom}
              onDefaultZoomChange={onDefaultZoomChange} // needs to be abstracted to handle other applications
            />
          ))}
      </WorkspaceApplicationList>
    </div>
  )
}

export default IndexPopup
