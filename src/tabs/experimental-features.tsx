import localize from "../utils/localize"

const ExperimentalVersionsPage = () => {
  return (
    <>
      <h1>{localize("ExperimentalFeaturesTabHeader")}</h1>
      <section id="docs-view-only">
        <h2>{localize("experimentalFeatureDocsViewOnlyHeader")}</h2>
      </section>
    </>
  )
}

export default ExperimentalVersionsPage
