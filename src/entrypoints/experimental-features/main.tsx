import { createRoot } from "react-dom/client";
import ExperimentalFeaturesPage from "src/tabs/experimental-features";
import { applyTextDirection } from "src/utils/text-direction";

applyTextDirection();

createRoot(document.getElementById("root")!).render(<ExperimentalFeaturesPage />);
