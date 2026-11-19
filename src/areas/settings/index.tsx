import { useStorage } from "@plasmohq/storage/hook";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "src/components/Button";
import { APPS, getDefaultAppState } from "src/constants";
import type { AppStorageState } from "src/types";
import localize from "src/utils/localize";
import { createSentryClient } from "src/utils/sentry/base";
import { SCHEMA_VERSION_KEY, storage } from "src/utils/storage";

const sentryScope = createSentryClient("popup");

const SettingsView = () => {
  const navigate = useNavigate();
  const [schemaVersion] = useStorage<number>({ key: SCHEMA_VERSION_KEY, instance: storage }, 1);
  const [isBusy, setIsBusy] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const onResetZoomSettingsClick = async () => {
    setIsBusy(true);
    const defaultStates = Object.fromEntries(
      Object.keys(APPS).map((storageKey) => [storageKey, getDefaultAppState(storageKey)])
    );

    try {
      await storage.setMany(defaultStates);
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

      {process.env.NODE_ENV === "development" && (
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

      <p
        style={{
          marginTop: 16,
          fontSize: 12,
          color: "var(--pico-muted-color)",
          textAlign: "center"
        }}>
        {localize("popupSettingsStorageVersion").replace("{schemaVersion}", String(schemaVersion))}
      </p>
    </div>
  );
};

export default SettingsView;
