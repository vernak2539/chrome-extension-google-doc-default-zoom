import type { ChangeEvent } from "react"

import { useStorage } from "@plasmohq/storage/hook"

const STORAGE_KEY = "zoomValue"

const zoomValues = ["Fit", "50%", "75%", "100%", "125%", "150%", "200%"]
const DEFAULT_ZOOM = zoomValues.at(3)

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
        {zoomValues.map((value) => {
          const isSelected = value === defaultZoom

          return <option selected={isSelected}>{value}</option>
        })}
      </select>
    </div>
  )
}

export default IndexPopup
