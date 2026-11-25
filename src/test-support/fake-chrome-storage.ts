type Listener = (changes: Record<string, { newValue?: unknown; oldValue?: unknown }>) => void;

type Keys = string | string[];

const wantedKeys = (data: Record<string, unknown>, keys?: Keys): string[] => {
  if (keys === undefined) {
    return Object.keys(data);
  }
  return Array.isArray(keys) ? keys : [keys];
};

const createArea = (data: Record<string, unknown>) => {
  const listeners = new Set<Listener>();

  const notify = (changes: Record<string, { newValue?: unknown; oldValue?: unknown }>) => {
    if (Object.keys(changes).length > 0) {
      listeners.forEach((listener) => listener(changes));
    }
  };

  return {
    data,
    get: async (keys?: Keys) => {
      const wanted = wantedKeys(data, keys);
      return Object.fromEntries(wanted.filter((key) => key in data).map((key) => [key, data[key]]));
    },
    set: async (items: Record<string, unknown>) => {
      const changes = Object.fromEntries(
        Object.entries(items).map(([key, newValue]) => [key, { newValue, oldValue: data[key] }])
      );
      Object.assign(data, items);
      notify(changes);
    },
    remove: async (keys: Keys) => {
      const wanted = wantedKeys(data, keys);
      // Like Chrome, report only the keys that were stored, and fire nothing if none were
      const changes = Object.fromEntries(
        wanted.filter((key) => key in data).map((key) => [key, { oldValue: data[key] }])
      );
      wanted.forEach((key) => delete data[key]);
      notify(changes);
    },
    onChanged: {
      addListener: (listener: Listener) => listeners.add(listener),
      removeListener: (listener: Listener) => listeners.delete(listener)
    }
  };
};

export interface FakeChromeStorage {
  /** What `chrome.storage.sync` holds: JSON text, which every released version writes, or plain values */
  data: Record<string, unknown>;
  /** Every `chrome.storage.sync.set` call, in order */
  setCalls: Record<string, unknown>[];
  /** Every `chrome.storage.sync.remove` call, in order */
  removeCalls: string[][];
  chrome: unknown;
}

/** An in-memory `chrome.storage` that records sync writes. Stub it with `vi.stubGlobal`. */
export const createFakeChromeStorage = (
  initial: Record<string, unknown> = {}
): FakeChromeStorage => {
  const fake: FakeChromeStorage = {
    data: { ...initial },
    setCalls: [],
    removeCalls: [],
    chrome: undefined
  };

  const syncArea = createArea(fake.data);
  const sync = {
    ...syncArea,
    set: async (items: Record<string, unknown>) => {
      fake.setCalls.push({ ...items });
      await syncArea.set(items);
    },
    remove: async (keys: Keys) => {
      fake.removeCalls.push(Array.isArray(keys) ? [...keys] : [keys]);
      await syncArea.remove(keys);
    }
  };
  // Dismissals are per-device UI state; keep them in a separate area, like chrome.storage.local
  const local = createArea({});

  fake.chrome = {
    runtime: { id: "test" },
    storage: {
      sync,
      local
    }
  };
  return fake;
};
