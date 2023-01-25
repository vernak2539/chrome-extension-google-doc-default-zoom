import { ChangeEvent, useEffect, useState } from "react"

import { Storage } from "~node_modules/@plasmohq/storage"

const storage = new Storage()
const STORAGE_KEY = "zoomValue"

const zoomValues = ["Fit", "50%", "75%", "125%", "150%", "200%"]

// how to call background TS message onload of page??

function IndexPopup() {
  const [defaultZoom, setDefaultZoom] = useState("100%")

  useEffect(() => {
    storage.get(STORAGE_KEY).then((value) => {
      if (value) {
        setDefaultZoom(value)
      }
    })
  }, [])

  const onDefaultZoomChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value
    setDefaultZoom(newValue)
    storage.set(STORAGE_KEY, newValue).then(() => {
      console.log("storage updated")
    })
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
