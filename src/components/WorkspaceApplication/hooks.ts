import { useStorage } from "@plasmohq/storage/hook";
import { useCallback } from "react";
import { getDefaultAppState } from "src/constants";
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

// Nothing is stored until the user changes a setting, so the setter can be handed `undefined`.
const resolveCurrentState = (
  prev: AppStorageState | undefined,
  storageKey: StorageKey
): AppStorageState => prev ?? getDefaultAppState(storageKey);

export const useWorkspaceStorage = (
  storageKey: StorageKey,
  defaultZoom: string
): UseWorkspaceStorage => {
  // No initial value on purpose: Plasmo saves whatever a function initializer returns, which wrote
  // to storage every time the popup opened.
  const [appState, setAppState, { isLoading }] = useStorage<AppStorageState>({
    key: storageKey,
    instance: storage
  });

  const state = resolveCurrentState(appState, storageKey);

  const updateZoomValue = useCallback(
    (value: string) => {
      setAppState((prev) => {
        const current = resolveCurrentState(prev, storageKey);
        return { ...current, zoomValue: value || defaultZoom };
      });
    },
    [setAppState, storageKey, defaultZoom]
  );

  const updateDocsViewOnlyValue = useCallback(
    (value: boolean) => {
      setAppState((prev) => {
        const current = resolveCurrentState(prev, storageKey);
        return { ...current, viewOnly: value ?? false };
      });
    },
    [setAppState, storageKey]
  );

  const updateClassroomSupportValue = useCallback(
    (value: boolean) => {
      setAppState((prev) => {
        const current = resolveCurrentState(prev, storageKey);
        return { ...current, classroomSupport: value ?? false };
      });
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
