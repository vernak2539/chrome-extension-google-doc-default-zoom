import { isChrome, isEdge } from "src/utils/get-browser";
import { setupSentryReactErrorBoundary } from "src/utils/sentry/react-error-boundary";
import localize from "../utils/localize";

const withSentryErrorBoundary = setupSentryReactErrorBoundary("tab");
const title = localize("ExtVersionsTabHeader");

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
  const requiredPermissionsTitle = localize(
    "ExtVersionsTabFunctionalityRequiredPermissionsHeader"
  );

  return (
    <>
      <p>
        <strong>{requiredPermissionsTitle}</strong>
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
  const showExtendedVersionInfo = isChrome() || isEdge();

  return (
    <>
      <h1>{title}</h1>
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

      {showExtendedVersionInfo && (
        <>
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
      )}
    </>
  );
};

export default withSentryErrorBoundary(ExtensionVersionsPage, title);
