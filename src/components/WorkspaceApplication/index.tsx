import classnames from "classnames"
import React, { useCallback, useId, useState } from "react"
import type { ChangeEvent } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import * as style from "../../style.module.css"
import type { WorkspaceApp } from "../../types"
import localize from "../../utils/localize"
import CustomZoomInput from "../CustomZoomInput"

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
  const [customZoomInput, setCustomZoomInput] = useState(zoom)

  const onDefaultZoomChangeViaSelect = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const newValue = event.target.value
    setZoom(newValue)
  }

  const onDefaultZoomChangeViaInput = (
    event: React.FocusEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.value
    setZoom(`${newValue}%`)
  }

  const updateValue = useCallback(
    (value) => {
      setZoom(value)
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
        <select
          className={classnames(
            style.applicationZoomInputBase,
            style.applicationZoomSelectInput,
            {
              [style.applicationActiveZoomInput]: !isCustomZoom
            }
          )}
          aria-label={localize("popupApplicationZoomSelectAriaLabel")}
          onChange={onDefaultZoomChangeViaSelect}
          value={zoom || defaultZoom}>
          {zoomValues.map((value) => {
            return <option key={useId()}>{value}</option>
          })}
        </select>
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
