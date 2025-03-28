import { useWorkspaceStorage } from "src/components/WorkspaceApplication/hooks";
import {
  DOCS_DEFAULT_ZOOM,
  DOCS_STORAGE_KEY,
  SHEETS_DEFAULT_ZOOM,
  SHEETS_STORAGE_KEY
} from "src/constants";
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

  console.log(
    "docsFeatureViewOnlyEnabled",
    docsFeatureViewOnlyEnabled,
    "docsFeatureClassroomSupportEnabled",
    docsFeatureClassroomSupportEnabled
  );

  return (
    <section>
      <h3>Experimental Features</h3>
      <p>
        These features are experimental and may not work as expected. They are
        not yet ready for production use. You can enable them below if you'd
        like!
      </p>
      <h4 className={styles.featureHeader}>Docs</h4>
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
            View Only
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
            Google Classroom Support
          </label>
        </li>
      </ul>
      <h4 className={styles.featureHeader}>Sheets</h4>
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
            Google Classroom Support
          </label>
        </li>
      </ul>
    </section>
  );
};

export default SettingsExperimentalFeatures;
