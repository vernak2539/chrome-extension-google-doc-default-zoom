import classnames from "classnames"
import type { WorkspaceApp, WorkspaceAppName } from "src/types"
import CustomZoomInput from "../CustomZoomInput"
import SelectZoomInput from "../SelectZoomInput"

import * as style from "../../style.module.css"

type PropsNew = {
  applicationName: WorkspaceAppName
  zoomLevel: string
  zoomLevelCustom: string
  zoomValues: WorkspaceApp["zoomValues"]
  features: WorkspaceApp["features"]
  isCustomZoomLevel: boolean
  updateZoomLevel: (newZoomValue: string) => void
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
  applicationName,
  isCustomZoomLevel,
  zoomLevel,
  zoomLevelCustom,
  zoomValues,
  features,
  updateZoomLevel
}: PropsNew) => {
  return (
    <li className={style.applicationListItem}>
      <span
        className={classnames(style.applicationIcon, {
          [style.applicationImageDocs]: applicationName === "Docs",
          [style.applicationImageSheets]: applicationName === "Sheets"
        })}
      />
      <span className={style.applicationTitle}>{applicationName}</span>
      <div className={style.applicationInputContainer}>
        <SelectZoomInput
          isCustomValue={isCustomZoomLevel}
          updateValue={updateZoomLevel}
          zoomValue={zoomLevel}
          zoomValues={zoomValues}
        />
        {features.customZoomInput && (
          <CustomZoomInput
            isCustomValue={isCustomZoomLevel}
            updateValue={updateZoomLevel}
            zoomValue={zoomLevelCustom}
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
