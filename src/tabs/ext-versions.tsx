import localize from "../utils/localize";

type Data = {
  supported: boolean;
  name: string;
};
const CheckList = ({ title, data }) => {
  return (
    <>
      <p>
        <strong>{title}:</strong>
      </p>
      <ul style={{ listStyle: "none", margin: 0, padding: "0 0 0 15px" }}>
        {data.map((d) => (
          <li>
            {d.supported ? "✅" : "❌"} {d.name}
          </li>
        ))}
      </ul>
    </>
  );
};

const RequiredPermissions = ({ permissions }) => {
  return (
    <>
      <p>
        <strong>Chrome Extension Permissions Required:</strong>
      </p>
      <p>{permissions.length > 0 ? permissions.join(", ") : "None"}</p>
    </>
  );
};

const supportedWorkspaceApps: Data[] = [
  {
    name: "Google Docs",
    supported: true
  },
  {
    name: "Google Sheets",
    supported: true
  }
];

const extDefaultFunctionality: Data[] = [
  {
    name: localize("ExtVersionsTabFunctionalityIncludedStandardZoom"),
    supported: true
  },
  {
    name: localize("ExtVersionsTabFunctionalityIncludedCustomZoom"),
    supported: false
  }
];

const extExtendedFunctionality: Data[] = [
  {
    name: localize("ExtVersionsTabFunctionalityIncludedStandardZoom"),
    supported: true
  },
  {
    name: localize("ExtVersionsTabFunctionalityIncludedCustomZoom"),
    supported: true
  }
];

const ExtensionVersionsPage = () => {
  return (
    <>
      <h1>{localize("ExtVersionsTabHeader")}</h1>
      <h2>{localize("extensionName")}</h2>
      <a href="https://chrome.google.com/webstore/detail/google-workspace-zoom-def/nflkcdlimipkgbacnfnhfecjgmojhklo">
        https://chrome.google.com/webstore/detail/google-workspace-zoom-def/nflkcdlimipkgbacnfnhfecjgmojhklo
      </a>
      <CheckList
        title={localize("ExtVersionsTabAppsSupportedHeader")}
        data={supportedWorkspaceApps}
      />
      <CheckList
        title={localize("ExtVersionsTabFunctionalityIncludedHeader")}
        data={extDefaultFunctionality}
      />
      <RequiredPermissions permissions={[]} />

      <br />

      <h2>{localize("extensionNameExtended")}</h2>
      <a href="https://chrome.google.com/webstore/detail/google-workspace-zoom-def/mdgikencgfhineaememjagpkiclbdkka">
        https://chrome.google.com/webstore/detail/google-workspace-zoom-def/mdgikencgfhineaememjagpkiclbdkka
      </a>
      <CheckList
        title={localize("ExtVersionsTabAppsSupportedHeader")}
        data={supportedWorkspaceApps}
      />
      <CheckList
        title={localize("ExtVersionsTabFunctionalityIncludedHeader")}
        data={extExtendedFunctionality}
      />
      <RequiredPermissions
        permissions={["`debugger` (this is an elevated permission)"]}
      />
      <small>
        <strong>
          <em>{localize("ExtVersionsTabExtendedPermissionExplanation")}</em>
        </strong>
      </small>
    </>
  );
};

export default ExtensionVersionsPage;
