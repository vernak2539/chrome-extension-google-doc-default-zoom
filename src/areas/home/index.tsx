import WorkspaceApplication from "src/components/WorkspaceApplication";
import WorkspaceApplicationList from "src/components/WorkspaceApplicationList";
import { workspaceApps } from "src/constants";
import localize from "src/utils/localize";
import Button from "../../components/Button";

interface Props {
  openSettingsView: () => void;
  showExtensionVersionsTab: boolean;
}

const HomeView = ({ openSettingsView, showExtensionVersionsTab }: Props) => {
  return (
    <>
      <p>{localize("popupMainSectionDescription")}</p>
      <WorkspaceApplicationList onSettingsClick={openSettingsView}>
        {workspaceApps
          .filter((app) => app.isEnabled)
          .map((app) => (
            <WorkspaceApplication
              key={app.name}
              name={app.name}
              zoomValues={app.zoomValues}
              defaultZoom={app.defaultZoom}
              storageKey={app.storageKey}
              features={app.features}
            />
          ))}
      </WorkspaceApplicationList>
      <br />
      <Button variant="secondary" size="small" onPress={openSettingsView}>
        Extension Settings
      </Button>
      {showExtensionVersionsTab && (
        <p>
          <a
            href="#"
            onClick={() => {
              chrome.tabs.create({
                url: "./tabs/ext-versions.html"
              });
            }}>
            <small>{localize("popupToExtensionVersionsTab")}</small>
          </a>
        </p>
      )}
    </>
  );
};

export default HomeView;
