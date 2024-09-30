import { Storage } from "@plasmohq/storage";
import SettingsIcon from "react:~/assets/popup_icons/settings.svg";
import { getFeatureViewOnlyStorageKey } from "src/constants";
import type { StorageKey } from "src/types";

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
        Extension Settings
      </h2>

      <section>
        <h3>Reset to Factory Default</h3>
        <p>
          Sometimes things go wrong. If you've tried everything else and
          nothing's working, you can click the button below to reset this
          extension to the state it was in when you first installed it.
        </p>
        <button onClick={onResetZoomSettingsClick}>
          Reset zoom settings to default
        </button>
      </section>
      <br />
      <hr />
      <br />
      <button onClick={onHomeClick}>Exit Settings</button>
    </div>
  );
};

export default SettingsView;
