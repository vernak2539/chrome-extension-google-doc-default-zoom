// Mock chrome.storage if it doesn't exist
if (typeof window !== "undefined" && !window.chrome) {
  (window as any).chrome = {
    runtime: {
      getManifest: () => ({ manifest_version: 3 }),
      getURL: (path: string) => path,
      id: "mock-extension-id",
      onMessage: {
        addListener: () => {},
        removeListener: () => {}
      }
    },
    storage: {
      sync: {
        get: (keys: any, callback: any) => {
          const result = {};
          if (Array.isArray(keys)) {
            keys.forEach((key) => ((result as any)[key] = undefined));
          } else if (typeof keys === "object" && keys !== null) {
            Object.keys(keys).forEach((key) => ((result as any)[key] = keys[key]));
          } else if (typeof keys === "string") {
            (result as any)[keys] = undefined;
          }
          if (callback) callback(result);
          return Promise.resolve(result);
        },
        set: (items: any, callback: any) => {
          if (callback) callback();
          return Promise.resolve();
        },
        remove: (keys: any, callback: any) => {
          if (callback) callback();
          return Promise.resolve();
        },
        onChanged: {
          addListener: () => {},
          removeListener: () => {}
        }
      },
      local: {
        get: (keys: any, callback: any) => {
          const result = {};
          if (callback) callback(result);
          return Promise.resolve(result);
        },
        set: (items: any, callback: any) => {
          if (callback) callback();
          return Promise.resolve();
        },
        remove: (keys: any, callback: any) => {
          if (callback) callback();
          return Promise.resolve();
        },
        onChanged: {
          addListener: () => {},
          removeListener: () => {}
        }
      },
      onChanged: {
        addListener: () => {},
        removeListener: () => {}
      }
    },
    i18n: {
      getMessage: (key: string) => {
        const messages: Record<string, any> = {
          extensionNameExtended: "Google Workspace Zoom (Extended)",
          popupSupportMeLabel: "Support me",
          popupNavHome: "Home",
          popupNavSettings: "Settings",
          popupMainSectionDescription: "Set default zoom for Google Docs and Sheets",
          popupToExtensionVersionsTab: "View extension versions",
          workspaceAppDocs: "Google Docs",
          workspaceAppSheets: "Google Sheets",
          popupSupportMe: "Support me"
        };
        return messages[key] || key;
      },
      getUILanguage: () => "en"
    },
    tabs: {
      create: () => {}
    }
  };
}
