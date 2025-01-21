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

// Checkbox that is very much tied to experimental features
interface ExperimentalFeatureCheckboxProps {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  content: string;
}

const ExperimentalFeatureCheckbox = ({
  isChecked,
  onChange,
  label,
  content
}: ExperimentalFeatureCheckboxProps) => {
  const onEduClick = () => {
    chrome.tabs.create({
      url: "./tabs/experimental-features.html"
    });
  };

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
          <ExperimentalFeatureCheckbox
            isChecked={featureDocsViewOnlyEnabled}
            onChange={updateDocsViewOnly}
            label="popupViewOnlyDocsExperimentalLabel"
            content="popupViewOnlyDocsExperimentalContent"
          />
        </div>
      )}
      {features.classroomSupport && (
        <div className={style.applicationListItemRow}>
          <span className={style.applicationItemRowSpacer} />
          <ExperimentalFeatureCheckbox
            isChecked={featureClassroomSupportEnabled}
            onChange={updateClassroomSupport}
            label="popupClassroomSupportExperimentalLabel"
            content="popupClassroomSupportExperimentalContent"
          />
        </div>
      )}
    </li>
  );
};

export default WorkspaceApplicationComponent;
