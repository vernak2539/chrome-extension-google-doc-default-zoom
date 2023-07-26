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
const Checkbox = ({ isChecked, onChange }) => {
  const onEduClick = () => {
    chrome.tabs.create({
      url: "./tabs/experimental-features.html#docs-view-only"
    })
  }

  return (
    <label className={style.applicationCheckbox}>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(event) => {
          onChange(event.target.checked)
        }}
      />
      <span>
        (
        <a href="#" onClick={onEduClick}>
          experimental
        </a>
        ) Enable for view-only Docs
      </span>
    </label>
  )
}

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
      <div className={style.applicationListItemRow}>
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
        </div>
      </div>
      {features.enableViewOnlyToggle && (
        <div className={style.applicationListItemRow}>
          <span className={style.applicationItemRowSpacer} />
          <Checkbox isChecked={false} onChange={() => {}} />
        </div>
      )}
    </li>
  )
}

export default WorkspaceApplicationComponent
