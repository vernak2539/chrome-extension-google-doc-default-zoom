import classnames from "classnames"
import { useId } from "react"
import type { ChangeEvent } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import * as style from "../../style.module.css"
import type { WorkspaceApp } from "../../types"
import localize from "../../utils/localize"

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

  const selectValueIsSelected = zoomValues.includes(zoom) || !zoom

  return (
    <li className={style.applicationListItem}>
      <span
        className={classnames(style.applicationIcon, {
          [style.applicationImageDocs]: name === "Docs",
          [style.applicationImageSheets]: name === "Sheets"
        })}
      />
      <span className={style.applicationTitle}>{name} </span>
      <div className={style.applicationInputContainer}>
        <select
          className={classnames(
            style.applicationZoomInputBase,
            style.applicationZoomSelectInput,
            {
              [style.applicationActiveZoomInput]: selectValueIsSelected
            }
          )}
          aria-label={localize("popupApplicationZoomSelectAriaLabel")}
          onChange={onDefaultZoomChange}
          value={zoom || defaultZoom}>
          {zoomValues.map((value) => {
            return <option key={useId()}>{value}</option>
          })}
        </select>
        <input
          placeholder="Custom Zoom" // TODO: Localise this
          value={selectValueIsSelected ? "" : zoom}
          maxLength={3}
          minLength={2}
          className={classnames(
            style.applicationZoomInputBase,
            style.applicationZoomCustomInput,
            {
              [style.applicationActiveZoomInput]: !selectValueIsSelected
            }
          )}
        />
      </div>
    </li>
  )
}

export default WorkspaceApplication
