import { Storage } from "@plasmohq/storage";
import SettingsIcon from "react:~/assets/popup_icons/settings.svg";
import { getFeatureViewOnlyStorageKey } from "src/constants";
import type { StorageKey } from "src/types";
import localize from "src/utils/localize";

interface Props {
  onHomeClick: () => void;
}

const SettingsView = ({ onHomeClick }: Props) => {
  const storage = new Storage();
  const storageKeys: StorageKey[] = ["zoomValue", "sheets:zoomValue"];

  const onResetZoomSettingsClick = () => {
    const resetProimises = storageKeys.flatMap((key) => {
      return [
        storage.remove(key),
        storage.remove(getFeatureViewOnlyStorageKey(key))
      ];
    });

    Promise.all(resetProimises).then(() => {
      console.log("Extension zoom values + feature keys reset");
    });
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
        <button onClick={onResetZoomSettingsClick}>
          {localize("popupSettingsResetToFactoryAction")}
        </button>
      </section>
      <br />
      <hr />
      <br />
      <button onClick={onHomeClick}>{localize("popupSettingsExit")}</button>
    </div>
  );
};

export default SettingsView;
