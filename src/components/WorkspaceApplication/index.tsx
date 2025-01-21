import type { WorkspaceApp } from "src/types";
import WorkspaceApplicationComponent from "./component";
import { useWorkspaceStorage } from "./hooks";

type Props = Omit<WorkspaceApp, "isEnabled">;

const WorkspaceApplication = ({
  name,
  zoomValues,
  defaultZoom,
  storageKey,
  features
}: Props) => {
  const {
    zoom,
    viewOnly,
    classroomSupport,
    updateZoomValue,
    updateDocsViewOnlyValue,
    updateClassroomSupportValue,
    isLoading
  } = useWorkspaceStorage(storageKey, defaultZoom);

  // we have not fetched the values required to render from storage, so we're not ready to render yet
  if (isLoading) {
    return null;
  }

  const isCustomZoom = zoom && !zoomValues.includes(zoom as any);

  return (
    <WorkspaceApplicationComponent
      applicationName={name}
      isCustomZoomLevel={isCustomZoom}
      updateZoomLevel={updateZoomValue}
      zoomLevel={zoom || defaultZoom}
      zoomLevelCustom={zoom}
      zoomValues={zoomValues}
      features={features}
      featureDocsViewOnlyEnabled={name === "Docs" ? viewOnly : false}
      updateDocsViewOnly={updateDocsViewOnlyValue}
      featureClassroomSupportEnabled={classroomSupport}
      updateClassroomSupport={updateClassroomSupportValue}
    />
  );
};

export default WorkspaceApplication;
