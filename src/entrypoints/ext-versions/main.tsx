import { createRoot } from "react-dom/client";
import ExtensionVersionsPage from "src/tabs/ext-versions";
import { applyTextDirection } from "src/utils/text-direction";

applyTextDirection();

createRoot(document.getElementById("root")!).render(<ExtensionVersionsPage />);
