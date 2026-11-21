import classnames from "classnames";
import type { AppStorageState, WorkspaceApp } from "src/types";

import localize from "../../utils/localize";
import CustomZoomInput from "../CustomZoomInput";
import SelectZoomInput from "../SelectZoomInput";

import style from "../../style.module.css";

type WorkspaceApplicationComponentProps = {
  app: Pick<WorkspaceApp, "name" | "zoomValues" | "features">;
  settings: AppStorageState;
  onChange: (patch: Partial<AppStorageState>) => void;
};

// Checkbox that is very much tied to experimental features
interface ExperimentalFeatureCheckboxProps {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  linkText: string;
  content: string;
  linkAnchor: string;
}

const ExperimentalFeatureCheckbox = ({
  isChecked,
  onChange,
  linkText,
  content,
  linkAnchor
}: ExperimentalFeatureCheckboxProps) => {
  const onEduClick = () => {
    chrome.tabs.create({
      url: `./experimental-features.html#${linkAnchor}`
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
          {localize(linkText)}
        </a>
        ) {localize(content)}
      </span>
    </label>
  );
};

const WorkspaceApplicationComponent = ({
  app,
  settings,
  onChange
}: WorkspaceApplicationComponentProps) => {
  const { name, zoomValues, features } = app;
  const isCustomZoom = !(zoomValues as readonly string[]).includes(settings.zoomValue);
  const updateZoom = (zoomValue: string) => onChange({ zoomValue });

  return (
    <li className={style.applicationListItem}>
      <div className={style.applicationListItemRow}>
        <span
          className={classnames(style.applicationIcon, {
            [style.applicationImageDocs]: name === "Docs",
            [style.applicationImageSheets]: name === "Sheets"
          })}
        />
        <span className={style.applicationTitle}>{name}</span>
        <div className={style.applicationInputContainer}>
          <SelectZoomInput
            isCustomValue={isCustomZoom}
            updateValue={updateZoom}
            zoomValue={settings.zoomValue}
            zoomValues={zoomValues}
          />
          {features.customZoomInput && (
            <CustomZoomInput
              isCustomValue={isCustomZoom}
              updateValue={updateZoom}
              zoomValue={isCustomZoom ? settings.zoomValue : ""}
              zoomValues={zoomValues}
            />
          )}
        </div>
      </div>
      {features.enableViewOnlyToggle && (
        <div className={style.applicationCheckboxContainer}>
          <span className={style.applicationItemRowSpacer} />
          <ExperimentalFeatureCheckbox
            isChecked={settings.viewOnly}
            onChange={(viewOnly) => onChange({ viewOnly })}
            linkText="popupViewOnlyDocsExperimentalLabel"
            content="popupViewOnlyDocsExperimentalContent"
            linkAnchor="docs-view-only"
          />
        </div>
      )}
      {features.classroomSupport && (
        <div className={style.applicationCheckboxContainer}>
          <span className={style.applicationItemRowSpacer} />
          <ExperimentalFeatureCheckbox
            isChecked={settings.classroomSupport}
            onChange={(classroomSupport) => onChange({ classroomSupport })}
            linkText="popupClassroomSupportExperimentalLabel"
            content="popupClassroomSupportExperimentalContent"
            linkAnchor="classroom-support"
          />
        </div>
      )}
    </li>
  );
};

export default WorkspaceApplicationComponent;
