import { DOCS_ZOOM_VALUES, SHEETS_ZOOM_VALUES } from "../constants"

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
