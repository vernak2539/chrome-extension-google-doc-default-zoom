import { createRoot } from "react-dom/client";
import Popup from "src/popup";
import { applyTextDirection } from "src/utils/text-direction";

applyTextDirection();

createRoot(document.getElementById("root")!).render(<Popup />);
