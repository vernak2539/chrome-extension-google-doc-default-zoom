import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";
import { useState } from "react";
import SettingsIcon from "react:~/assets/popup_icons/settings-inverted.svg";
import Button from "src/components/Button";
import type { AppStorageState, StorageKey } from "src/types";
import localize from "src/utils/localize";
import { createSentryClient } from "src/utils/sentry/base";
import { SCHEMA_VERSION_KEY } from "src/utils/storage-migration";

const DEFAULT_APP_STATE: AppStorageState = {
  zoomValue: "100%",
  viewOnly: false,
  classroomSupport: false
};

const sentryScope = createSentryClient("popup");

const SettingsView = () => {
  const storage = new Storage();
  const [schemaVersion] = useStorage<number>(SCHEMA_VERSION_KEY, 1);
  const storageKeys: StorageKey[] = ["docs", "sheets"];
  const [isBusy, setIsBusy] = useState(false);

  const onResetZoomSettingsClick = async () => {
    setIsBusy(true);
    const resetPromises = storageKeys.map((key) => storage.set(key, { ...DEFAULT_APP_STATE }));

    try {
      await Promise.all(resetPromises);
    } catch (error) {
      sentryScope.captureException(error);
      console.error("Failed to reset storage", error);
    } finally {
      setIsBusy(false);
    }
  };

  const onDowngradeToV1Click = async () => {
    setIsBusy(true);

    try {
      // Read current V2 state before deleting
      const docsState = await storage.get<AppStorageState>("docs");
      const sheetsState = await storage.get<AppStorageState>("sheets");

      // Delete V2 keys
      await storage.remove("docs");
      await storage.remove("sheets");
      await storage.remove(SCHEMA_VERSION_KEY);

      // Recreate V1 flat keys from the current state
      if (docsState) {
        await storage.set("zoomValue", docsState.zoomValue);
        await storage.set("zoomValue:viewOnly", docsState.viewOnly);
        await storage.set("zoomValue:classroomSupport", docsState.classroomSupport);
      }
      if (sheetsState) {
        await storage.set("sheets:zoomValue", sheetsState.zoomValue);
        await storage.set("sheets:zoomValue:viewOnly", sheetsState.viewOnly);
        await storage.set("sheets:zoomValue:classroomSupport", sheetsState.classroomSupport);
      }

      alert(
        "Downgraded to V1 flat keys. The background script will auto-migrate to V2 the next time the extension restarts (e.g. from chrome://extensions)."
      );
    } catch (error) {
      sentryScope.captureException(error);
      console.error("Failed to downgrade storage to V1 flat keys", error);
      alert(
        "Failed to downgrade to V1 flat keys. Storage may be partially updated; please retry or inspect extension storage before continuing."
      );
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div>
      <h2 style={{ display: "flex", alignItems: "center" }}>
        <SettingsIcon width={20} height={20} style={{ marginRight: 3 }} />
        {localize("popupSettingsTitle")}
      </h2>

      <section>
        <h3>{localize("popupSettingsResetToFactoryTitle")}</h3>
        <p>{localize("popupSettingsResetToFactoryDescription")}</p>
        <Button variant="danger" onPress={onResetZoomSettingsClick} isDisabled={isBusy}>
          {localize("popupSettingsResetToFactoryAction")}
        </Button>
      </section>

      {process.env.NODE_ENV === "development" && (
        <>
          <br />
          <hr />
          <br />
          <section>
            <h3>🛠 Dev Tools</h3>
            <p>
              Downgrade storage schema to V1 format (flat keys) and reload to test auto-migration.
            </p>
            <Button variant="danger" onPress={onDowngradeToV1Click} isDisabled={isBusy}>
              Downgrade to V1 Format
            </Button>
          </section>
        </>
      )}

      <p
        style={{
          marginTop: 16,
          fontSize: 12,
          color: "#595959",
          textAlign: "center"
        }}>
        {localize("popupSettingsStorageVersion").replace("{schemaVersion}", String(schemaVersion))}
      </p>
    </div>
  );
};

export default SettingsView;
