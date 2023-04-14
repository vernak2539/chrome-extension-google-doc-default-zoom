import classnames from "classnames"
import { useId } from "react"
import type { ChangeEvent } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import * as style from "../../style.module.css"
import type { WorkspaceApp } from "../../types"

type Props = Omit<WorkspaceApp, "isEnabled">

const WorkspaceApplication = ({
  name,
  zoomValues,
  defaultZoom,
  storageKey
}: Props) => {
  const [zoom, setZoom] = useStorage(storageKey, (storedZoom) => {
    return typeof storedZoom === "undefined" ? defaultZoom : storedZoom
  })

  const onDefaultZoomChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value
    setZoom(newValue)
  }

  return (
    <li className={style.applicationListItem}>
      <span
        className={classnames(style.applicationIcon, {
          [style.applicationImageDocs]: name === "Docs",
          [style.applicationImageSheets]: name === "Sheets"
        })}
      />
      <span className={style.applicationTitle}>{name} </span>
      <select onChange={onDefaultZoomChange} value={zoom}>
        {zoomValues.map((value) => {
          return <option key={useId()}>{value}</option>
        })}
      </select>
    </li>
  )
}

export default WorkspaceApplication
