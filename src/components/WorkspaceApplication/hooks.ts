import { useStorage } from "@plasmohq/storage/hook";
import { useCallback } from "react";
import {
  getFeatureClassroomSupportStorageKey,
  getFeatureViewOnlyStorageKey
} from "src/constants";

const NOT_READY = "__NOT_READY__INTERNAL_DONT_USE__";

interface UseWorkspaceStorage {
  zoom: string;
  viewOnly: boolean;
  classroomSupport: boolean;
  updateZoomValue: (value: string) => void;
  updateDocsViewOnlyValue: (value: boolean) => void;
  updateClassroomSupportValue: (value: boolean) => void;
  isLoading: boolean;
}

export const useWorkspaceStorage = (
  storageKey: string,
  defaultZoom: string
): UseWorkspaceStorage => {
  const [zoom, setZoom] = useStorage(storageKey, (storedZoom, isHydrating) => {
    if (storedZoom !== undefined) {
      return storedZoom;
    }
    if (isHydrating === undefined) {
      return NOT_READY;
    }
    return defaultZoom;
  });

  const [viewOnly, setViewOnly] = useStorage(
    getFeatureViewOnlyStorageKey(storageKey),
    (storedViewOnly, isHydrating) => {
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
    [setZoom, defaultZoom]
  );

  const updateDocsViewOnlyValue = useCallback(
    (value: boolean) => {
      setViewOnly(value || false);
    },
    [setViewOnly]
  );

  const updateClassroomSupportValue = useCallback(
    (value: boolean) => {
      setClassroomSupport(value || false);
    },
    [setClassroomSupport]
  );

  const isLoading =
    zoom === NOT_READY ||
    viewOnly === NOT_READY ||
    classroomSupport === NOT_READY;

  return {
    zoom,
    viewOnly,
    classroomSupport,
    updateZoomValue,
    updateDocsViewOnlyValue,
    updateClassroomSupportValue,
    isLoading
  };
};
