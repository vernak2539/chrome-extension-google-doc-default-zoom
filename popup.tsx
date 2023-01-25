import { ChangeEvent, useState } from "react"

import { Storage } from "~node_modules/@plasmohq/storage"

const storage = new Storage()

// todo
// - select selected things based on saved value

const zoomValues = ["Fit", "50%", "75%", "125%", "150%", "200%"]

function IndexPopup() {
  const [defaultZoom, setDefaultZoom] = useState("100%")

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDefaultZoom(event.target.value)
  }

  return (
    <div>
      <h1>Default Google Docs Zoom</h1>
      <p>
        Select the default zoom that you'd like Google Docs to use when loading.
      </p>
      {/*// how to load this dynamically*/}
      <select onChange={onChange}>
        {zoomValues.map((value) => {
          const isSelected = value === defaultZoom

          return <option selected={isSelected}>{value}</option>
        })}
      </select>
    </div>
  )
}

export default IndexPopup
