import classnames from "classnames"
import React, { useCallback, useEffect, useState } from "react"

import * as style from "../../style.module.css"
import localize from "../../utils/localize"
import type { ZoomInputProps } from "../shared-props"

const CustomZoomInput = ({
  zoomValue,
  isCustomValue,
  updateValue
}: ZoomInputProps) => {
  const [localZoom, setLocalZoom] = useState(zoomValue || "")

  useEffect(() => {
    if (!isCustomValue) {
      setLocalZoom("")
    }
  }, [isCustomValue])

  const updateZoom = useCallback(
    (value) => {
      const newValue = Boolean(value) ? `${value}%` : ""

      // don't update the values if we've remove the value and we're using the select box values
      if (newValue === "" && !isCustomValue) {
        return
      }

      setLocalZoom(newValue)
      updateValue(newValue)
    },
    [setLocalZoom, updateValue]
  )

  // TODO:
  //  - only allow values between 50 and 200 for custom zoom value
  //  - only allow integers...
  //  - allow for value update on "Enter"
  return (
    <input
      placeholder={localize("popupApplicationCustomZoomInputPlaceholder")}
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
        const allowedUpdateTriggers = ["Enter", "Tab"]
        const allowedInputKeys = [
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

        if (allowedUpdateTriggers.includes(event.key)) {
          updateZoom(event.currentTarget.value)
          event.currentTarget.blur()
          return
        }

        if (/[0-9]/.test(event.key) || allowedInputKeys.includes(event.key)) {
          return
        }
        event.preventDefault()
      }}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalZoom(event.target.value)
      }}
      onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
        updateZoom(event.target.value)
      }}
    />
  )
}

export default CustomZoomInput
