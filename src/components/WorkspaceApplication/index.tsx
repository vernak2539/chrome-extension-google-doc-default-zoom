import classnames from "classnames"
import { useCallback } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import * as style from "../../style.module.css"
import type { WorkspaceApp } from "../../types"
import CustomZoomInput from "../CustomZoomInput"
import SelectZoomInput from "../SelectZoomInput"

type Props = Omit<WorkspaceApp, "isEnabled">

const NOT_READY = "__NOT_READY__INTERNAL_DONT_USE__"

// Checkbox component that takes isChecked and onChange props
const Checkbox = ({ isChecked, onChange }) => {
  return (
    <label className={style.applicationCheckbox}>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(event) => {
          onChange(event.target.checked)
        }}
      />
      <span>Enable View Only</span>
    </label>
  )
}

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

  const [viewOnly, setViewOnly] = useStorage(
    `${storageKey}:viewOnly`,
    (storedViewOnly, isHydrating) => {
      // Helpful post https://discord.com/channels/946290204443025438/1080875092667551824/1080875092667551824
      if (storedViewOnly) {
        return storedViewOnly
      }
      if (isHydrating === undefined) {
        return NOT_READY
      }
      if (storedViewOnly === undefined) {
        return false
      }
    }
  )

  const updateZoomValue = useCallback(
    (value) => {
      if (value) {
        setZoom(value)
      } else {
        setZoom(defaultZoom)
      }
    },
    [setZoom]
  )

  const updateViewOnlyValue = useCallback(
    (value) => {
      if (value) {
        setViewOnly(value)
      } else {
        setViewOnly(false)
      }
    },
    [setZoom]
  )

  const isCustomZoom = zoom && !zoomValues.includes(zoom)

  // we have not fetched the zoom value from storage, so we're not ready to render yet
  // if (zoom === NOT_READY || viewOnly === NOT_READY) {
  //   return
  // }

  return (
    <li className={style.applicationListItem}>
      <span
        className={classnames(style.applicationIcon, {
          [style.applicationImageDocs]: name === "Docs",
          [style.applicationImageSheets]: name === "Sheets"
        })}
      />
      <span className={style.applicationTitle}>{name}</span>
      <div className={style.applicationInputContainer}>
        <SelectZoomInput
          isCustomValue={isCustomZoom}
          updateValue={updateZoomValue}
          zoomValue={zoom || defaultZoom}
          zoomValues={zoomValues}
        />
        {features.customZoomInput && (
          <CustomZoomInput
            isCustomValue={isCustomZoom}
            updateValue={updateZoomValue}
            zoomValue={zoom}
            zoomValues={zoomValues}
          />
        )}
        {features.enableViewOnlyToggle && (
          <Checkbox isChecked={viewOnly} onChange={updateViewOnlyValue} />
        )}
      </div>
    </li>
  )
}

export default WorkspaceApplication
