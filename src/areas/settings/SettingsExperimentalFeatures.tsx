import { useWorkspaceStorage } from "src/components/WorkspaceApplication/hooks";
import {
  DOCS_DEFAULT_ZOOM,
  DOCS_STORAGE_KEY,
  SHEETS_DEFAULT_ZOOM,
  SHEETS_STORAGE_KEY
} from "src/constants";
import localize from "src/utils/localize";
import styles from "./styles.module.css";

const SettingsExperimentalFeatures = () => {
  const {
    viewOnly: docsFeatureViewOnlyEnabled,
    classroomSupport: docsFeatureClassroomSupportEnabled,
    updateDocsViewOnlyValue: docsFeatureSetViewOnlyEnabled,
    updateClassroomSupportValue: docsFeatureSetClassroomSupportEnabled
  } = useWorkspaceStorage(DOCS_STORAGE_KEY, DOCS_DEFAULT_ZOOM);

  const {
    classroomSupport: sheetsFeatureClassroomSupportEnabled,
    updateClassroomSupportValue: sheetsFeatureSetClassroomSupportEnabled
  } = useWorkspaceStorage(SHEETS_STORAGE_KEY, SHEETS_DEFAULT_ZOOM);

  return (
    <section>
      <h3>{localize("popupSettingsViewExperimentalFeaturesTitle")}</h3>
      <p>{localize("popupSettingsViewExperimentalFeaturesDescription")}</p>
      <h4 className={styles.featureHeader}>
        {localize("popupSettingsViewExperimentalFeaturesDocsTitle")}
      </h4>
      <ul className={styles.list}>
        <li>
          <label htmlFor="docs-feature-view-only">
            <input
              id="docs-feature-view-only"
              type="checkbox"
              checked={docsFeatureViewOnlyEnabled || false}
              onChange={(event) => {
                docsFeatureSetViewOnlyEnabled(event.target.checked);
              }}
            />
            {localize("popupSettingsViewExperimentalFeaturesDocsViewOnlyLabel")}
          </label>
        </li>
        <li>
          <label htmlFor="docs-feature-classroom-support">
            <input
              id="docs-feature-classroom-support"
              type="checkbox"
              checked={docsFeatureClassroomSupportEnabled || false}
              onChange={(event) => {
                docsFeatureSetClassroomSupportEnabled(event.target.checked);
              }}
            />
            {localize(
              "popupSettingsViewExperimentalFeaturesDocsClassroomSupportLabel"
            )}
          </label>
        </li>
      </ul>
      <h4 className={styles.featureHeader}>
        {localize("popupSettingsViewExperimentalFeaturesSheetsTitle")}
      </h4>
      <ul className={styles.list}>
        <li>
          <label htmlFor="sheets-feature-classroom-support">
            <input
              id="sheets-feature-classroom-support"
              type="checkbox"
              checked={sheetsFeatureClassroomSupportEnabled || false}
              onChange={(event) => {
                sheetsFeatureSetClassroomSupportEnabled(event.target.checked);
              }}
            />
            {localize(
              "popupSettingsViewExperimentalFeaturesSheetsClassroomSupportLabel"
            )}
          </label>
        </li>
      </ul>
    </section>
  );
};

export default SettingsExperimentalFeatures;
