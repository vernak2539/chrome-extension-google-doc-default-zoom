import type { ChangeEvent } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import {
  DEFAULT_ZOOM,
  IS_ACTIVE_STORAGE_KEY,
  ZOOM_VALUES,
  ZOOM_VALUE_STORAGE_KEY
} from "./constants"

function IndexPopup() {
  const [activeState] = useStorage(
    IS_ACTIVE_STORAGE_KEY,
    (storedActiveState) => {
      return typeof storedActiveState === "undefined"
        ? false
        : storedActiveState
    }
  )
  const [defaultZoom, setDefaultZoom] = useStorage(
    ZOOM_VALUE_STORAGE_KEY,
    (storedZoom) => {
      return typeof storedZoom === "undefined" ? DEFAULT_ZOOM : storedZoom
    }
  )

  const onDefaultZoomChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value
    setDefaultZoom(newValue)
  }

  return (
    <div style={{ minWidth: "250px" }}>
      <h2>Default Google Docs Zoom</h2>
      <p>Available: {activeState ? "enabled" : "disabled"}</p>
      <p>
        Select the default zoom that you'd like Google Docs to use when it first
        loads.
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
