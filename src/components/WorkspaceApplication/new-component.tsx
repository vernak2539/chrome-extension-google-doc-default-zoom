import classnames from "classnames";
import type { WorkspaceApp, WorkspaceAppName } from "src/types";
import localize from "src/utils/localize";
import CustomZoomInput from "../CustomZoomInput";
import ExperimentalCheckbox from "../ExperimentalCheckbox";
import SelectZoomInput from "../SelectZoomInput";
import * as styles from "./styles.module.css";

interface ApplicationSectionProps {
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
}

const ApplicationSection = ({
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
}: ApplicationSectionProps) => {
  return (
    <section
      className={classnames(
        styles.container,
        styles[`container__${applicationName.toLowerCase()}`]
      )}>
      <div className={styles.content}>
        <h2>{applicationName}</h2>
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
        <div className={styles.checkboxContainer}>
          {features.enableViewOnlyToggle && (
            <ExperimentalCheckbox
              label={localize("popupViewOnlyDocsExperimentalContent")}
              isChecked={featureDocsViewOnlyEnabled}
              onChange={updateDocsViewOnly}
              onExperimentalClick={() => {
                chrome.tabs.create({
                  url: `./tabs/experimental-features.html#docs-view-only`
                });
              }}
            />
          )}
          {features.classroomSupport && (
            <ExperimentalCheckbox
              label={localize("popupClassroomSupportExperimentalContent")}
              isChecked={featureClassroomSupportEnabled}
              onChange={updateClassroomSupport}
              onExperimentalClick={() => {
                chrome.tabs.create({
                  url: `./tabs/experimental-features.html#classroom-support`
                });
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default ApplicationSection;
