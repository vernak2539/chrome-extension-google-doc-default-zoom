import classnames from "classnames";
import type { WorkspaceApp, WorkspaceAppName } from "src/types";
import localize from "../../utils/localize";
import CustomZoomInput from "../CustomZoomInput";
import SelectZoomInput from "../SelectZoomInput";

import * as style from "../../style.module.css";

type WorkspaceApplicationComponentProps = {
  applicationName: WorkspaceAppName;
  zoomLevel: string;
  zoomLevelCustom: string;
  zoomValues: WorkspaceApp["zoomValues"];
  features: WorkspaceApp["features"];
  featureDocsViewOnlyEnabled: boolean;
  isCustomZoomLevel: boolean;
  updateZoomLevel: (newZoomValue: string) => void;
  updateDocsViewOnly: (newDocsViewOnlyValue: boolean) => void;
  featureClassroomSupportEnabled: boolean;
  updateClassroomSupport: (newClassroomSupportValue: boolean) => void;
};

// Checkbox component that takes isChecked and onChange props
// this is very much tied to experimental features, but can be updated in the future
const Checkbox = ({ isChecked, onChange, type = "viewOnly" }) => {
  const onEduClick = () => {
    chrome.tabs.create({
      url:
        "./tabs/experimental-features.html#" +
        (type === "viewOnly" ? "docs-view-only" : "classroom-support")
    });
  };

  const label =
    type === "viewOnly"
      ? "popupViewOnlyDocsExperimentalLabel"
      : "popupClassroomSupportExperimentalLabel";
  const content =
    type === "viewOnly"
      ? "popupViewOnlyDocsExperimentalContent"
      : "popupClassroomSupportExperimentalContent";

  return (
    <label className={style.applicationCheckbox}>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(event) => {
          onChange(event.target.checked);
        }}
      />
      <span>
        (
        <a href="#" onClick={onEduClick}>
          {localize(label)}
        </a>
        ) {localize(content)}
      </span>
    </label>
  );
};

const WorkspaceApplicationComponent = ({
  applicationName,
  isCustomZoomLevel,
  zoomLevel,
  zoomLevelCustom,
  zoomValues,
  features,
  updateZoomLevel,
  updateClassroomSupport,
  updateDocsViewOnly,
  featureDocsViewOnlyEnabled,
  featureClassroomSupportEnabled
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
            type="viewOnly"
          />
        </div>
      )}
      {features.classroomSupport && (
        <div className={style.applicationListItemRow}>
          <span className={style.applicationItemRowSpacer} />
          <Checkbox
            isChecked={featureClassroomSupportEnabled}
            onChange={updateClassroomSupport}
            type="classroom"
          />
        </div>
      )}
    </li>
  );
};

export default WorkspaceApplicationComponent;
