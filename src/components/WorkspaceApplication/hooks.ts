import { useStorage } from "@plasmohq/storage/hook";
import { useCallback } from "react";
import { fillAppState, getDefaultAppState } from "src/constants";
import type { AppStorageState, StorageKey } from "src/types";
import { storage } from "src/utils/storage";

interface UseWorkspaceStorage {
  zoom: string;
  viewOnly: boolean;
  classroomSupport: boolean;
  updateZoomValue: (value: string) => void;
  updateDocsViewOnlyValue: (value: boolean) => void;
  updateClassroomSupportValue: (value: boolean) => void;
  isLoading: boolean;
}

export const useWorkspaceStorage = (storageKey: StorageKey): UseWorkspaceStorage => {
  // No initial value on purpose: Plasmo saves whatever a function initializer returns, which wrote
  // to storage every time the popup opened.
  const [appState, setAppState, { isLoading }] = useStorage<AppStorageState>({
    key: storageKey,
    instance: storage
  });

  // Nothing is stored until the user changes a setting, so the stored state and the setter's
  // `prev` can be `undefined`, or an object that lacks a field. `fillAppState` fills both in.
  const state = fillAppState(storageKey, appState);

  const updateZoomValue = useCallback(
    (value: string) => {
      setAppState((prev) => ({
        ...fillAppState(storageKey, prev),
        zoomValue: value || getDefaultAppState(storageKey).zoomValue
      }));
    },
    [setAppState, storageKey]
  );

  const updateDocsViewOnlyValue = useCallback(
    (value: boolean) => {
      setAppState((prev) => ({ ...fillAppState(storageKey, prev), viewOnly: value ?? false }));
    },
    [setAppState, storageKey]
  );

  const updateClassroomSupportValue = useCallback(
    (value: boolean) => {
      setAppState((prev) => ({
        ...fillAppState(storageKey, prev),
        classroomSupport: value ?? false
      }));
    },
    [setAppState, storageKey]
  );

  return {
    zoom: state.zoomValue,
    viewOnly: state.viewOnly,
    classroomSupport: state.classroomSupport,
    updateZoomValue,
    updateDocsViewOnlyValue,
    updateClassroomSupportValue,
    isLoading
  };
};
