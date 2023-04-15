import classnames from "classnames"
import React, { useEffect, useState } from "react"

import * as style from "../../style.module.css"
import type { WorkspaceApp } from "../../types"
import type { ZoomInputProps } from "../shared-props"

type Props = ZoomInputProps & {
  defaultZoom: WorkspaceApp["defaultZoom"]
}

const CustomZoomInput = ({
  zoomValue,
  isCustomValue,
  updateValue,
  defaultZoom
}: Props) => {
  const [localZoom, setLocalZoom] = useState(zoomValue || "")

  useEffect(() => {
    if (!isCustomValue) {
      setLocalZoom("")
    }
  }, [isCustomValue])

  return (
    <input
      placeholder="Custom Zoom" // TODO: Localise this
      value={localZoom}
      maxLength={3}
      minLength={2}
      className={classnames(
        style.applicationZoomInputBase,
        style.applicationZoomCustomInput,
        {
          [style.applicationActiveZoomInput]: isCustomValue
        }
      )}
      onFocus={(event) => {
        const value = event.target.value
        if (value.includes("%")) {
          setLocalZoom(value.replace(/%/g, ""))
        }
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
        const allowedKeys = [
          "Clear",
          "Backspace",
          "Delete",
          "EraseEof",
          "Undo",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp"
        ]

        if (/[0-9]/.test(event.key) || allowedKeys.includes(event.key)) {
          return
        }
        event.preventDefault()
      }}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalZoom(event.target.value)
      }}
      onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
        const newValue = Boolean(event.target.value)
          ? `${event.target.value}%`
          : ""

        setLocalZoom(newValue)
        updateValue(newValue)
      }}
    />
  )
}

export default CustomZoomInput
