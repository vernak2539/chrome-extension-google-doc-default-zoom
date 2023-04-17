import classnames from "classnames"
import React, { ChangeEvent, useId } from "react"

import * as style from "../../style.module.css"
import type { WorkspaceApp } from "../../types"
import localize from "../../utils/localize"
import type { ZoomInputProps } from "../shared-props"

type Props = ZoomInputProps & {
  zoomValues: WorkspaceApp["zoomValues"]
}

const SelectOptions = ({ zoomValues }) => {
  return (
    <>
      {zoomValues.map((value) => {
        return <option key={useId()}>{value}</option>
      })}
    </>
  )
}
const SelectOptionsWithNa = ({ zoomValues }) => {
  return (
    <>
      <option key={useId()}>N/A</option>
      <SelectOptions zoomValues={zoomValues} />
    </>
  )
}

const SelectZoomInput = ({
  zoomValue,
  isCustomValue,
  updateValue,
  zoomValues
}: Props) => {
  return (
    <select
      className={classnames(
        style.applicationZoomInputBase,
        style.applicationZoomSelectInput,
        {
          [style.applicationActiveZoomInput]: !isCustomValue
        }
      )}
      aria-label={localize("popupApplicationZoomSelectAriaLabel")}
      onChange={(event: ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value
        updateValue(newValue)
      }}
      value={zoomValue}>
      {!isCustomValue && <SelectOptions zoomValues={zoomValues} />}
      {isCustomValue && <SelectOptionsWithNa zoomValues={zoomValues} />}
    </select>
  )
}

export default SelectZoomInput
