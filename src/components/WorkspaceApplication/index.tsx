import classnames from "classnames"
import React, { useCallback } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import * as style from "../../style.module.css"
import type { WorkspaceApp } from "../../types"
import CustomZoomInput from "../CustomZoomInput"
import SelectZoomInput from "../SelectZoomInput"

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

  const updateValue = useCallback(
    (value) => {
      console.log(value)
      if (value) {
        setZoom(value)
      } else {
        setZoom(defaultZoom)
      }
    },
    [setZoom]
  )

  const isCustomZoom = zoom && !zoomValues.includes(zoom)

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
        <SelectZoomInput
          isCustomValue={isCustomZoom}
          updateValue={updateValue}
          zoomValue={zoom || defaultZoom}
          zoomValues={zoomValues}
        />
        <CustomZoomInput
          isCustomValue={isCustomZoom}
          updateValue={updateValue}
          zoomValue={zoom}
        />
      </div>
    </li>
  )
}

export default WorkspaceApplication
