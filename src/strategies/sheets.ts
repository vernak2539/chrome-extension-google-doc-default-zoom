import { AbstractBaseStrategy } from "./base";

class SheetsStrategy extends AbstractBaseStrategy {
  protected performZoom(zoomValue: string) {
    this.uiExecuteFlow(zoomValue);
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
