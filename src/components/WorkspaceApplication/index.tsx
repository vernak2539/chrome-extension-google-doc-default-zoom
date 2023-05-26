import classnames from "classnames"
import { useCallback } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import * as style from "../../style.module.css"
import type { WorkspaceApp } from "../../types"
import CustomZoomInput from "../CustomZoomInput"
import SelectZoomInput from "../SelectZoomInput"

type Props = Omit<WorkspaceApp, "isEnabled">

const NOT_READY = "__NOT_READY__INTERNAL_DONT_USE__"

const WorkspaceApplication = ({
  name,
  zoomValues,
  defaultZoom,
  storageKey,
  features
}: Props) => {
  const [zoom, setZoom] = useStorage(storageKey, (storedZoom, isHydrating) => {
    // Helpful post https://discord.com/channels/946290204443025438/1080875092667551824/1080875092667551824
    if (storedZoom) {
      return storedZoom
    }
    if (isHydrating === undefined) {
      return NOT_READY
    }
    if (storedZoom === undefined) {
      return defaultZoom
    }
  })

  const updateValue = useCallback(
    (value) => {
      if (value) {
        setZoom(value)
      } else {
        setZoom(defaultZoom)
      }
    },
    [setZoom]
  )

  const isCustomZoom = zoom && !zoomValues.includes(zoom)

  // we have not fetched the zoom value from storage, so we're not ready to render yet
  if (zoom === NOT_READY) {
    return
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
      <div className={style.applicationInputContainer}>
        <SelectZoomInput
          isCustomValue={isCustomZoom}
          updateValue={updateValue}
          zoomValue={zoom || defaultZoom}
          zoomValues={zoomValues}
        />
        {features.customZoomInput && (
          <CustomZoomInput
            isCustomValue={isCustomZoom}
            updateValue={updateValue}
            zoomValue={zoom}
            zoomValues={zoomValues}
          />
        )}
      </div>
    </li>
  )
}

export default WorkspaceApplication
