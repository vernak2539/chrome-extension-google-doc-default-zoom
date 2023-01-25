import type { ChangeEvent } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { DEFAULT_ZOOM, STORAGE_KEY, ZOOM_VALUES } from "./constants"

// todo - build in enabled/disabled state state

function IndexPopup() {
  const [defaultZoom, setDefaultZoom] = useStorage(
    STORAGE_KEY,
    (storedZoom) => {
      return typeof storedZoom === "undefined" ? DEFAULT_ZOOM : storedZoom
    }
  )

  const onDefaultZoomChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value
    setDefaultZoom(newValue)
  }

  return (
    <div>
      <h1>Default Google Docs Zoom</h1>
      <p>
        Select the default zoom that you'd like Google Docs to use when loading.
      </p>
      {/*// how to load this dynamically*/}
      <select onChange={onDefaultZoomChange}>
        {ZOOM_VALUES.map((value) => {
          const isSelected = value === defaultZoom

          return <option selected={isSelected}>{value}</option>
        })}
      </select>
    </div>
  )
}

export default IndexPopup
