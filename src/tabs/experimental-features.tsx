import { setupSentryReactErrorBoundary } from "src/utils/sentry/react-error-boundary";
import localize from "../utils/localize";

const withSentryErrorBoundary = setupSentryReactErrorBoundary("tab");
const title = localize("ExperimentalFeaturesTabHeader");

const ExperimentalVersionsPage = () => {
  return (
    <div style={{ maxWidth: "500px" }}>
      <h1>{title}</h1>
      <section id="docs-view-only">
        <h2>{localize("ExperimentalFeaturesTabDocsViewOnlyHeader")}</h2>
        <p>{localize("ExperimentalFeaturesTabDocsViewOnlyContent1")}</p>
        <p>{localize("ExperimentalFeaturesTabDocsViewOnlyContent2")}</p>
        <p>{localize("ExperimentalFeaturesTabDocsViewOnlyContent3")}</p>
        <p>{localize("ExperimentalFeaturesTabDocsViewOnlyContent4")}</p>
      </section>

      <section id="classroom-support">
        <h2>{localize("ExperimentalFeaturesTabClassroomSupportHeader")}</h2>
        <p>{localize("ExperimentalFeaturesTabClassroomSupportContent1")}</p>
        <p>{localize("ExperimentalFeaturesTabClassroomSupportContent2")}</p>
      </section>
    </div>
  );
};

export default withSentryErrorBoundary(ExperimentalVersionsPage, title);
