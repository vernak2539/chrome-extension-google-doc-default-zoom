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

  const state = isLoading ? { ...DEFAULT_APP_STATE, zoomValue: defaultZoom } : appState;

  const updateZoomValue = useCallback(
    (value: string) => {
      setAppState((prev) => {
        const current = prev === NOT_READY ? { ...DEFAULT_APP_STATE, zoomValue: defaultZoom } : prev;
        return { ...current, zoomValue: value || defaultZoom };
      });
    },
    [setAppState, defaultZoom]
  );

  const updateDocsViewOnlyValue = useCallback(
    (value: boolean) => {
      setAppState((prev) => {
        const current = prev === NOT_READY ? { ...DEFAULT_APP_STATE, zoomValue: defaultZoom } : prev;
        return { ...current, viewOnly: value ?? false };
      });
    },
    [setAppState, defaultZoom]
  );

  const updateClassroomSupportValue = useCallback(
    (value: boolean) => {
      setAppState((prev) => {
        const current = prev === NOT_READY ? { ...DEFAULT_APP_STATE, zoomValue: defaultZoom } : prev;
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
