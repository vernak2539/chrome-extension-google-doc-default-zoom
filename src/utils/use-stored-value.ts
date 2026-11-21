import { useCallback, useEffect, useRef, useState } from "react";
import { storage, type StorageItemKey } from "wxt/utils/storage";

import { readStoredValue, watchStoredValue } from "./storage";

/**
 * Reads a storage value and keeps it in sync with changes, like Plasmo's `useStorage` did.
 * Nothing is written until `update` is called, so mounting the popup never writes defaults.
 */
export const useStoredValue = <T>(key: StorageItemKey) => {
  const [value, setValue] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const valueRef = useRef<T | null>(null);
  // A watch event can arrive before the first read resolves; that newer value must win.
  const revisionRef = useRef(0);

  const apply = useCallback((next: T | null) => {
    revisionRef.current += 1;
    valueRef.current = next;
    setValue(next);
  }, []);

  useEffect(() => {
    let isActive = true;
    const revisionAtStart = revisionRef.current;

    const unwatch = watchStoredValue<T>(key, (next) => {
      if (isActive) {
        apply(next);
      }
    });

    readStoredValue<T>(key).then((stored) => {
      if (isActive && revisionRef.current === revisionAtStart) {
        apply(stored);
      }
      if (isActive) {
        setIsLoading(false);
      }
    });

    return () => {
      isActive = false;
      unwatch();
    };
  }, [key, apply]);

  const update = useCallback(
    (updater: (previous: T | null) => T) => {
      // Read from the ref, so several updates in a row build on each other
      const next = updater(valueRef.current);
      apply(next);
      return storage.setItem(key, next);
    },
    [key, apply]
  );

  return [value, update, { isLoading }] as const;
};
