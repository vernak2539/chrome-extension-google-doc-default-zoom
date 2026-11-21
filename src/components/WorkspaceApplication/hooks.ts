import { useCallback } from "react";
import { fillAppState, getDefaultAppState } from "src/constants";
import type { AppStorageState, StorageKey } from "src/types";
import { appStateKey } from "src/utils/storage";
import { useStoredValue } from "src/utils/use-stored-value";

export interface UseAppSettings {
  settings: AppStorageState;
  updateSettings: (patch: Partial<AppStorageState>) => void;
  isLoading: boolean;
}

/** Keeps the popup from showing or writing an empty zoom: an empty zoom means the default */
const withZoom = (storageKey: StorageKey, state: AppStorageState): AppStorageState => ({
  ...state,
  zoomValue: state.zoomValue || getDefaultAppState(storageKey).zoomValue
});

export const useAppSettings = (storageKey: StorageKey): UseAppSettings => {
  const [appState, setAppState, { isLoading }] = useStoredValue<Partial<AppStorageState>>(
    appStateKey(storageKey)
  );

  // Nothing is stored until the user changes a setting, so the stored state and the setter's
  // `prev` can be `undefined`, or an object that lacks a field. `fillAppState` fills both in.
  const settings = withZoom(storageKey, fillAppState(storageKey, appState));

  const updateSettings = useCallback(
    (patch: Partial<AppStorageState>) => {
      setAppState((prev) => withZoom(storageKey, { ...fillAppState(storageKey, prev), ...patch }));
    },
    [setAppState, storageKey]
  );

  return { settings, updateSettings, isLoading };
};
