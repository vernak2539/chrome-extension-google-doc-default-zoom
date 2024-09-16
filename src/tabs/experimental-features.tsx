import localize from "../utils/localize";

const ExperimentalVersionsPage = () => {
  return (
    <div style={{ maxWidth: "500px" }}>
      <h1>{localize("ExperimentalFeaturesTabHeader")}</h1>
      <section id="docs-view-only">
        <h2>{localize("ExperimentalFeaturesTabDocsViewOnlyHeader")}</h2>
        <p>{localize("ExperimentalFeaturesTabDocsViewOnlyContent1")}</p>
        <p>{localize("ExperimentalFeaturesTabDocsViewOnlyContent2")}</p>
        <p>{localize("ExperimentalFeaturesTabDocsViewOnlyContent3")}</p>
        <p>{localize("ExperimentalFeaturesTabDocsViewOnlyContent4")}</p>
      </section>
    </div>
  );
};

export default ExperimentalVersionsPage;
