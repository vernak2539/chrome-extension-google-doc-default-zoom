import { useStorage } from "@plasmohq/storage/hook";
import { useCallback } from "react";
import {
  getFeatureClassroomSupportStorageKey,
  getFeatureViewOnlyStorageKey
} from "src/constants";
import type { WorkspaceApp } from "src/types";
import WorkspaceApplicationComponent from "./component";

type Props = Omit<WorkspaceApp, "isEnabled">;

const NOT_READY = "__NOT_READY__INTERNAL_DONT_USE__";

const WorkspaceApplication = ({
  name,
  zoomValues,
  defaultZoom,
  storageKey,
  features
}: Props) => {
  const [zoom, setZoom] = useStorage(storageKey, (storedZoom, isHydrating) => {
    // Helpful post https://discord.com/channels/946290204443025438/1080875092667551824/1080875092667551824
    if (storedZoom !== undefined) {
      return storedZoom;
    }
    if (isHydrating === undefined) {
      return NOT_READY;
    }
    return defaultZoom;
  });

  // Note: this will set up a false zoom value for Sheets by default.
  // This shouldn't be a problem as view only for sheets is already handled in the main flow (and
  // I won't be checking storage for it)
  const [viewOnly, setViewOnly] = useStorage(
    getFeatureViewOnlyStorageKey(storageKey),
    (storedViewOnly, isHydrating) => {
      // Helpful post https://discord.com/channels/946290204443025438/1080875092667551824/1080875092667551824
      if (storedViewOnly !== undefined) {
        return storedViewOnly;
      }
      if (isHydrating === undefined) {
        return NOT_READY;
      }
      return false;
    }
  );

  const [classroomSupport, setClassroomSupport] = useStorage(
    getFeatureClassroomSupportStorageKey(storageKey),
    (storedClassroomSupport, isHydrating) => {
      console.log(
        "storedClassroomSupport",
        storedClassroomSupport,
        isHydrating
      );
      // Helpful post https://discord.com/channels/946290204443025438/1080875092667551824/1080875092667551824
      if (storedClassroomSupport !== undefined) {
        return storedClassroomSupport;
      }
      if (isHydrating === undefined) {
        return NOT_READY;
      }
      return false;
    }
  );

  const updateZoomValue = useCallback(
    (value: string) => {
      setZoom(value || defaultZoom);
    },
    [setZoom]
  );

  const updateDocsViewOnlyValue = useCallback(
    (value) => {
      if (value) {
        setViewOnly(value);
      } else {
        setViewOnly(false);
      }
    },
    [setViewOnly]
  );

  const updateClassroomSupportValue = useCallback(
    (value) => {
      if (value) {
        setClassroomSupport(value);
      } else {
        setClassroomSupport(false);
      }
    },
    [setClassroomSupport]
  );

  // we have not fetched the values required to render from storage, so we're not ready to render yet
  if (
    zoom === NOT_READY ||
    viewOnly === NOT_READY ||
    classroomSupport === NOT_READY
  ) {
    return null;
  }

  const isCustomZoom = zoom && !zoomValues.includes(zoom);

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
