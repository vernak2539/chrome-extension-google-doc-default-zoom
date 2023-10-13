import classnames from "classnames"
import type { WorkspaceApp, WorkspaceAppName } from "src/types"
import localize from "../../utils/localize"
import CustomZoomInput from "../CustomZoomInput"
import SelectZoomInput from "../SelectZoomInput"

import * as style from "../../style.module.css"

type WorkspaceApplicationComponentProps = {
  applicationName: WorkspaceAppName
  zoomLevel: string
  zoomLevelCustom: string
  zoomValues: WorkspaceApp["zoomValues"]
  features: WorkspaceApp["features"]
  featureDocsViewOnlyEnabled: boolean
  isCustomZoomLevel: boolean
  updateZoomLevel: (newZoomValue: string) => void
  updateDocsViewOnly: (newDocsViewOnlyValue: boolean) => void
}

// Checkbox component that takes isChecked and onChange props
// this is very much tied to experimental features, but can be updated in the future
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
          {localize("popupViewOnlyDocsExperimentalLabel")}
        </a>
        ) {localize("popupViewOnlyDocsExperimentalContent")}
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
  updateZoomLevel,
  updateDocsViewOnly,
  featureDocsViewOnlyEnabled
}: WorkspaceApplicationComponentProps) => {
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
          <Checkbox
            isChecked={featureDocsViewOnlyEnabled}
            onChange={updateDocsViewOnly}
          />
        </div>
      )}
    </li>
  )
}

export default WorkspaceApplicationComponent
