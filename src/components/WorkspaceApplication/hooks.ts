import { useStorage } from "@plasmohq/storage/hook";
import { useCallback } from "react";
import type { AppStorageState } from "src/types";

const DEFAULT_APP_STATE: AppStorageState = {
  zoomValue: "",
  viewOnly: false,
  classroomSupport: false
};

interface UseWorkspaceStorage {
  zoom: string;
  viewOnly: boolean;
  classroomSupport: boolean;
  updateZoomValue: (value: string) => void;
  updateDocsViewOnlyValue: (value: boolean) => void;
  updateClassroomSupportValue: (value: boolean) => void;
  isLoading: boolean;
}

const NOT_READY = "__NOT_READY__INTERNAL__";

// Storage hands the setter `undefined` while nothing is stored yet, so fall back to the defaults.
const resolveCurrentState = (
  prev: AppStorageState | typeof NOT_READY | undefined,
  defaultZoom: string
): AppStorageState =>
  prev === undefined || prev === NOT_READY
    ? { ...DEFAULT_APP_STATE, zoomValue: defaultZoom }
    : prev;

export const useWorkspaceStorage = (
  storageKey: string,
  defaultZoom: string
): UseWorkspaceStorage => {
  const [appState, setAppState] = useStorage<AppStorageState | typeof NOT_READY>(
    storageKey,
    (stored, isHydrating) => {
      if (stored !== undefined) {
        return stored;
      }
      if (isHydrating === undefined) {
        return NOT_READY;
      }
      return {
        ...DEFAULT_APP_STATE,
        zoomValue: defaultZoom
      };
    }
  );

  const isLoading = appState === NOT_READY;

  const state = resolveCurrentState(appState, defaultZoom);

  const updateZoomValue = useCallback(
    (value: string) => {
      setAppState((prev) => {
        const current = resolveCurrentState(prev, defaultZoom);
        return { ...current, zoomValue: value || defaultZoom };
      });
    },
    [setAppState, defaultZoom]
  );

  const updateDocsViewOnlyValue = useCallback(
    (value: boolean) => {
      setAppState((prev) => {
        const current = resolveCurrentState(prev, defaultZoom);
        return { ...current, viewOnly: value ?? false };
      });
    },
    [setAppState, defaultZoom]
  );

  const updateClassroomSupportValue = useCallback(
    (value: boolean) => {
      setAppState((prev) => {
        const current = resolveCurrentState(prev, defaultZoom);
        return { ...current, classroomSupport: value ?? false };
      });
    },
    [setAppState, defaultZoom]
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
