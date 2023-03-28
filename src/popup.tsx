// Icon used in Favicon was created by https://www.flaticon.com/authors/royyan-wijaya
import WorkspaceApplication from "~components/WorkspaceApplication"
import WorkspaceApplicationList from "~components/WorkspaceApplicationList"
import workspaceApps from "~workspace-apps"

// todo - build in enabled/disabled state state

function IndexPopup() {
  return (
    <div style={{ minWidth: "310px" }}>
      <h2>Google Workspace Zoom Default</h2>
      <p>
        Select the default zoom you'd like your Google Workspace applications to
        use when they first load.
      </p>
      <WorkspaceApplicationList>
        {workspaceApps
          .filter((app) => app.isEnabled)
          .map((app) => (
            <WorkspaceApplication
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
