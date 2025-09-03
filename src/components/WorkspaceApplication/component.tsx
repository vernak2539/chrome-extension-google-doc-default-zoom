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
  isCustomZoomLevel: boolean;
  updateZoomLevel: (newZoomValue: string) => void;
};

const WorkspaceApplicationComponent = ({
  applicationName,
  isCustomZoomLevel,
  zoomLevel,
  zoomLevelCustom,
  zoomValues,
  features,
  updateZoomLevel
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
      <div className={style.applicationListItemRow}>
        <span className={style.applicationItemRowSpacer} />
        <p className={style.applicationExperimentalFeatureContent}>
          {localize("popupWorkspaceComponentSeeExtensionSettings")}
        </p>
      </div>
    </li>
  );
};

export default WorkspaceApplicationComponent;
