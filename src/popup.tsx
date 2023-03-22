// Icon used in Favicon was created by https://www.flaticon.com/authors/royyan-wijaya
import type { ChangeEvent } from "react"

import { useStorage } from "@plasmohq/storage/hook"

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
    <div style={{ minWidth: "250px" }}>
      <h2>Google Docs Zoom Default</h2>
      <p>
        Select the default zoom that you'd like Google Docs to use when it first
        loads.
      </p>
      {/*// how to load this dynamically*/}
      <select onChange={onDefaultZoomChange} value={defaultZoom}>
        {DOCS_ZOOM_VALUES.map((value) => {
          return <option>{value}</option>
        })}
      </select>
    </div>
  )
}

export default IndexPopup
