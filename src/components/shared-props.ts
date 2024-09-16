import type { WorkspaceApp } from "../types";

export interface ZoomInputProps {
  isCustomValue: boolean;
  updateValue: (newZoomValue: string) => void;
  zoomValue: string;
  zoomValues: WorkspaceApp["zoomValues"];
}
