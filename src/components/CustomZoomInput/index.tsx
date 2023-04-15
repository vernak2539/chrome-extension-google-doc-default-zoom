import classnames from "classnames"
import React, { useEffect, useState } from "react"

import * as style from "../../style.module.css"
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
      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
        setLocalZoom(event.target.value)
      }
      onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
        const newValue = `${event.target.value}%`
        setLocalZoom(newValue)
        updateValue(newValue)
      }}
    />
  )
}

export default CustomZoomInput
