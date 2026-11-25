import localize from "src/utils/localize";

const VersionInfo = () => {
  const version = chrome?.runtime?.getManifest?.().version;
  const branch = import.meta.env.GIT_BRANCH;
  const commit = import.meta.env.GIT_COMMIT;
  const showGitInfo = import.meta.env.COMMAND === "serve" && Boolean(branch) && Boolean(commit);

  return (
    <>
      {version && (
        <p style={{ margin: 0 }}>
          {localize("popupSettingsExtensionVersion").replace("{version}", version)}
        </p>
      )}
      {showGitInfo && (
        <p style={{ margin: 0 }}>
          {localize("popupSettingsBuildGitInfo")
            .replace("{branch}", String(branch))
            .replace("{commit}", String(commit))}
        </p>
      )}
    </>
  );
};

export default VersionInfo;
