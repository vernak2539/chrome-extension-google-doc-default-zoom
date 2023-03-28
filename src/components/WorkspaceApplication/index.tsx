import { useId } from "react"
import type { ChangeEvent } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import type { WorkspaceApp } from "~workspace-apps"

import * as style from "../../style.module.css"

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
