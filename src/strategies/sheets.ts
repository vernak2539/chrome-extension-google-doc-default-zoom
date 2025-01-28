import { isGoogleClassroomSubmittedAssignment } from "src/utils/classroom-helpers";
import type { UiStrategyConfig } from "../types";
import { AbstractBaseStrategy, type AbstractBaseStrategyImpl } from "./base";

class SheetsStrategy
  extends AbstractBaseStrategy
  implements AbstractBaseStrategyImpl
{
  constructor(config: UiStrategyConfig) {
    super(config);
  }

  execute() {
    const isGoogleClassroomDocument = isGoogleClassroomSubmittedAssignment();

    Promise.all([
      this.getZoomValueFromStorage(),
      this.isGoogleClassroomEnabled()
    ]).then(([zoomValue, isGoogleClassroomEnabled]) => {
      if (isGoogleClassroomDocument && !isGoogleClassroomEnabled) {
        return;
      }

      this.uiExecuteFlow(zoomValue);
    });
  }

  /**
   * This function tells us if the sheets is in preview mode. There is no menu in preview mode, so we can't zoom
   *
   * example preview URL: "/spreadsheets/u/0/d/XXXX-XX/preview/sheet";
   * example preview URL: "/spreadsheets/u/0/d/XXXX-XX/preview";
   */
  public isUIPreview(href: string): boolean {
    const { pathname } = new URL(href);
    const sheetsPreviewRegex1 = /\/preview\/sheet$/;
    const sheetsPreviewRegex2 = /\/preview$/;

    if (sheetsPreviewRegex1.test(pathname)) {
      return true;
    }

    if (sheetsPreviewRegex2.test(pathname)) {
      return true;
    }

    return false;
  }

  // getIsViewOnly() {
  //   return false
  // }
}

export default SheetsStrategy;
