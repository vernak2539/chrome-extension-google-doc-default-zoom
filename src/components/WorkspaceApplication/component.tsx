import classnames from "classnames"
import type { WorkspaceApp, WorkspaceAppName } from "src/types"
import CustomZoomInput from "../CustomZoomInput"
import SelectZoomInput from "../SelectZoomInput"

import * as style from "../../style.module.css"
import type { ZoomInputProps } from "../shared-props"

type Props = ZoomInputProps & {
  name: WorkspaceAppName
  features: WorkspaceApp["features"]
  zoomValueCustom: string
}

// Checkbox component that takes isChecked and onChange props
// const Checkbox = ({ isChecked, onChange }) => {
//   return (
//     <label className={style.applicationCheckbox}>
//       <input
//         type="checkbox"
//         checked={isChecked}
//         onChange={(event) => {
//           onChange(event.target.checked)
//         }}
//       />
//       <span>Enable View Only</span>
//     </label>
//   )
// }

const WorkspaceApplicationComponent = ({
  name,
  isCustomValue,
  zoomValue,
  zoomValueCustom,
  zoomValues,
  features,
  updateValue
}: Props) => {
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
          isCustomValue={isCustomValue}
          updateValue={updateValue}
          zoomValue={zoomValue}
          zoomValues={zoomValues}
        />
        {features.customZoomInput && (
          <CustomZoomInput
            isCustomValue={isCustomValue}
            updateValue={updateValue}
            zoomValue={zoomValueCustom}
            zoomValues={zoomValues}
          />
        )}
        {/* {features.enableViewOnlyToggle && (
          <Checkbox isChecked={viewOnly} onChange={updateViewOnlyValue} />
        )} */}
      </div>
    </li>
  )
}

export default WorkspaceApplicationComponent
