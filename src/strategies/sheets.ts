import type { AppStorageState, ZoomOutcome } from "src/types";
import { skipped } from "src/utils/zoom-outcome";

import { AbstractBaseStrategy } from "./base";

class SheetsStrategy extends AbstractBaseStrategy {
  protected performZoom(appState: AppStorageState): ZoomOutcome | Promise<ZoomOutcome> {
    const isViewOnlyEnabled = this.isFeatureEnabled("enableViewOnlyToggle") && appState.viewOnly;

    if (isViewOnlyEnabled && this.isUIViewOnly()) {
      return skipped("view_only");
    }

    return this.uiExecuteFlow(appState.zoomValue);
  }

  /**
   * This function tells us if the sheets is in preview mode. There is no menu in preview mode, so we can't zoom
   *
   * example preview URL: "/spreadsheets/u/0/d/XXXX-XX/preview/sheet";
   * example preview URL: "/spreadsheets/u/0/d/XXXX-XX/preview";
   */
  public isUIPreview(href: string): boolean {
    return /\/preview(\/sheet)?$/.test(new URL(href).pathname);
  }
}

export default SheetsStrategy;
