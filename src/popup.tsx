// Icon used in Favicon was created by https://www.flaticon.com/authors/royyan-wijaya
import type { ChangeEvent } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import WorkplaceApplicationSelect from "~components/WorkplaceApplicationSelect"
import WorkplaceApplicationSelectList from "~components/WorkplaceApplicationSelectList"
import {
  DEFAULT_ZOOM as DOCS_DEFAULT_ZOOM,
  STORAGE_KEY as DOCS_STORAGE_KEY,
  ZOOM_VALUES as DOCS_ZOOM_VALUES
} from "~strategies/docs"

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
      <WorkplaceApplicationSelectList>
        <WorkplaceApplicationSelect
          application="Docs"
          values={DOCS_ZOOM_VALUES}
          selectedValue={defaultZoom}
          onDefaultZoomChange={onDefaultZoomChange} // needs to be abstracted to handle other applications
        />
      </WorkplaceApplicationSelectList>
    </div>
  )
}

export default IndexPopup
