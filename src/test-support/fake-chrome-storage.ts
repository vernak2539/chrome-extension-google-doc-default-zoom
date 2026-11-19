type Listener = (
  changes: Record<string, { newValue?: unknown; oldValue?: unknown }>,
  areaName: string
) => void;

export interface FakeChromeStorage {
  /** What `chrome.storage.sync` holds: JSON strings, as Plasmo writes them */
  data: Record<string, unknown>;
  /** Every `chrome.storage.sync.set` call, in order */
  setCalls: Record<string, unknown>[];
  /** Every `chrome.storage.sync.remove` call, in order */
  removeCalls: string[][];
  chrome: unknown;
}

/** An in-memory `chrome.storage.sync` that records its writes. Stub it with `vi.stubGlobal`. */
export const createFakeChromeStorage = (
  initial: Record<string, unknown> = {}
): FakeChromeStorage => {
  const fake: FakeChromeStorage = {
    data: { ...initial },
    setCalls: [],
    removeCalls: [],
    chrome: undefined
  };
  const listeners = new Set<Listener>();

  const sync = {
    get: async (keys?: string[]) => {
      const wanted = keys ?? Object.keys(fake.data);
      return Object.fromEntries(
        wanted.filter((key) => key in fake.data).map((key) => [key, fake.data[key]])
      );
    },
    set: async (items: Record<string, unknown>) => {
      fake.setCalls.push({ ...items });
      const changes = Object.fromEntries(
        Object.entries(items).map(([key, newValue]) => [
          key,
          { newValue, oldValue: fake.data[key] }
        ])
      );
      Object.assign(fake.data, items);
      listeners.forEach((listener) => listener(changes, "sync"));
    },
    remove: async (keys: string[]) => {
      fake.removeCalls.push([...keys]);
      // Like Chrome, report only the keys that were stored, and fire nothing if none were
      const changes = Object.fromEntries(
        keys.filter((key) => key in fake.data).map((key) => [key, { oldValue: fake.data[key] }])
      );
      keys.forEach((key) => delete fake.data[key]);
      if (Object.keys(changes).length > 0) {
        listeners.forEach((listener) => listener(changes, "sync"));
      }
    }
  };

  fake.chrome = {
    storage: {
      sync,
      onChanged: {
        addListener: (listener: Listener) => listeners.add(listener),
        removeListener: (listener: Listener) => listeners.delete(listener)
      }
    }
  };
  return fake;
};
