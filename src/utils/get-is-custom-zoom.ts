import type { WorkspaceAppName } from "src/types";
import { DOCS_ZOOM_VALUES, SHEETS_ZOOM_VALUES } from "../constants";

const getIsCustomZoom = (application: WorkspaceAppName, zoomValue: any) => {
  if (application === "Sheets" && SHEETS_ZOOM_VALUES.includes(zoomValue)) {
    return false;
  }

  if (application === "Docs" && DOCS_ZOOM_VALUES.includes(zoomValue)) {
    return false;
  }

  return true;
};

export default getIsCustomZoom;
