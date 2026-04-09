import WorkspaceApplication from "src/components/WorkspaceApplication";
import WorkspaceApplicationList from "src/components/WorkspaceApplicationList";
import { workspaceApps } from "src/constants";
import { showExtensionVersionsTab } from "src/utils/get-browser";
import localize from "src/utils/localize";

const HomeView = () => {
  return (
    <>
      <p>{localize("popupMainSectionDescription")}</p>
      <WorkspaceApplicationList>
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
