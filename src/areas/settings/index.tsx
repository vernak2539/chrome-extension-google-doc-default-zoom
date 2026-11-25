import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "src/components/Button";
import VersionInfo from "src/components/VersionInfo";
import type { AppStorageState } from "src/types";
import localize from "src/utils/localize";
import { createSentryClient } from "src/utils/sentry/base";
import {
  appStateKey,
  readStoredValue,
  SCHEMA_VERSION_KEY,
  CURRENT_SCHEMA_VERSION,
  writeStoredValues
} from "src/utils/storage";
import { resetStorageToDefaults, writeStorageAsPlainValues } from "src/utils/storage-dev-tools";
import { useStoredValue } from "src/utils/use-stored-value";
import { storage, type StorageItemKey } from "wxt/utils/storage";

const sentryScope = createSentryClient("popup");

const SettingsView = () => {
  const navigate = useNavigate();
  const [schemaVersion] = useStoredValue<number>(SCHEMA_VERSION_KEY);
  const [isBusy, setIsBusy] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const onResetZoomSettingsClick = async () => {
    setIsBusy(true);

    try {
      await resetStorageToDefaults();
    } catch (error) {
      sentryScope.captureException(error);
      console.error("Failed to reset storage", error);
    } finally {
      if (isMounted.current) {
        setIsBusy(false);
      }
    }
  };

  const onDowngradeToV1Click = async () => {
    setIsBusy(true);

    try {
      // Read current V2 state before deleting
      const docsState = await readStoredValue<AppStorageState>(appStateKey("docs"));
      const sheetsState = await readStoredValue<AppStorageState>(appStateKey("sheets"));

      // Delete V2 keys
      await storage.removeItems([appStateKey("docs"), appStateKey("sheets"), SCHEMA_VERSION_KEY]);

      // Recreate V1 flat keys from the current state, as JSON text like the Plasmo versions wrote them
      const v1Writes: { key: StorageItemKey; value: unknown }[] = [];
      if (docsState) {
        v1Writes.push(
          { key: "sync:zoomValue", value: docsState.zoomValue },
          { key: "sync:zoomValue:viewOnly", value: docsState.viewOnly },
          { key: "sync:zoomValue:classroomSupport", value: docsState.classroomSupport }
        );
      }
      if (sheetsState) {
        v1Writes.push(
          { key: "sync:sheets:zoomValue", value: sheetsState.zoomValue },
          { key: "sync:sheets:zoomValue:viewOnly", value: sheetsState.viewOnly },
          { key: "sync:sheets:zoomValue:classroomSupport", value: sheetsState.classroomSupport }
        );
      }
      if (v1Writes.length > 0) {
        await writeStoredValues(v1Writes);
      }

      alert(
        `Downgraded to V1 flat keys. The background script will auto-migrate to V${CURRENT_SCHEMA_VERSION} the next time the extension restarts (e.g. from chrome://extensions).`
      );
    } catch (error) {
      sentryScope.captureException(error);
      console.error("Failed to downgrade storage to V1 flat keys", error);
      alert(
        "Failed to downgrade to V1 flat keys. Storage may be partially updated; please retry or inspect extension storage before continuing."
      );
    } finally {
      if (isMounted.current) {
        setIsBusy(false);
      }
    }
  };
  const onWritePlainValuesClick = async () => {
    setIsBusy(true);

    try {
      await writeStorageAsPlainValues();
      alert(
        "Wrote the settings as plain values (schemaVersion 2). Restart the extension (e.g. from chrome://extensions) to see the background rewrite them as JSON text."
      );
    } catch (error) {
      sentryScope.captureException(error);
      console.error("Failed to write storage as plain values", error);
      alert(
        "Failed to write the settings as plain values. Check the extension console for details."
      );
    } finally {
      if (isMounted.current) {
        setIsBusy(false);
      }
    }
  };
  const onExitSettingsClick = () => {
    navigate("/");
  };
  return (
    <div>
      <section>
        <h2>{localize("popupSettingsResetToFactoryTitle")}</h2>
        <p>{localize("popupSettingsResetToFactoryDescription")}</p>
        <Button
          variant="danger"
          onPress={onResetZoomSettingsClick}
          isDisabled={isBusy}
          size="small">
          {localize("popupSettingsResetToFactoryAction")}
        </Button>
      </section>

      {import.meta.env.COMMAND === "serve" && (
        <>
          <hr />
          <br />
          <section>
            <h2>🛠 Dev Tools</h2>
            <p>
              Downgrade storage schema to V1 format (flat keys) and reload to test auto-migration.
            </p>
            <Button
              variant="danger"
              onPress={onDowngradeToV1Click}
              isDisabled={isBusy}
              size="small">
              Downgrade to V1 Format
            </Button>
            <p>
              Write the current settings as plain values, the way builds stored them before settings
              went back to JSON text. Reload the extension and check that it still applies the same
              zoom.
            </p>
            <Button
              variant="danger"
              onPress={onWritePlainValuesClick}
              isDisabled={isBusy}
              size="small">
              Write Settings as Plain Values
            </Button>
          </section>
        </>
      )}

      <br />
      <hr />
      <br />

      <section style={{ textAlign: "center" }}>
        <Button variant="secondary" onPress={onExitSettingsClick} isDisabled={isBusy} size="small">
          {localize("popupSettingsExit")}
        </Button>
      </section>

      <footer
        style={{
          marginTop: 16,
          fontSize: 12,
          color: "var(--pico-muted-color)",
          textAlign: "center"
        }}>
        <p style={{ margin: 0 }}>
          {localize("popupSettingsStorageVersion").replace(
            "{schemaVersion}",
            String(schemaVersion ?? 1)
          )}
        </p>
        <VersionInfo />
      </footer>
    </div>
  );
};

export default SettingsView;
