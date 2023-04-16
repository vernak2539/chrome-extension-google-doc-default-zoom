import { ZOOM_VALUES as DOCS_ZOOM_VALUES } from "../strategies/docs"
import { ZOOM_VALUES as SHEETS_ZOOM_VALUES } from "../strategies/sheets"

const getIsCustomZoom = (zoomValue: any) => {
  if (SHEETS_ZOOM_VALUES.includes(zoomValue)) {
    return false
  }

  if (DOCS_ZOOM_VALUES.includes(zoomValue)) {
    return false
  }

  return true
}

export default getIsCustomZoom
