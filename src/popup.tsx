// Icon used in Favicon was created by https://www.flaticon.com/authors/royyan-wijaya
import WorkspaceApplication from "~components/WorkspaceApplication"
import WorkspaceApplicationList from "~components/WorkspaceApplicationList"
import workspaceApps from "~workspace-apps"

// todo - build in enabled/disabled state state

function IndexPopup() {
  return (
    <div style={{ minWidth: "310px" }}>
      <h2>{chrome.i18n.getMessage("extensionName")}</h2>
      <p>{chrome.i18n.getMessage("popupMainSectionDescription")}</p>
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
            />
          ))}
      </WorkspaceApplicationList>
    </div>
  )
}

export default IndexPopup
