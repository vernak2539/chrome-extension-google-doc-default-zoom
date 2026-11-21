import type { WorkspaceApp } from "src/types";

import WorkspaceApplicationComponent from "./component";
import { useAppSettings } from "./hooks";

type Props = { app: WorkspaceApp };

const WorkspaceApplication = ({ app }: Props) => {
  const { settings, updateSettings, isLoading } = useAppSettings(app.storageKey);

  // we have not fetched the values required to render from storage, so we're not ready to render yet
  if (isLoading) {
    return null;
  }

  return <WorkspaceApplicationComponent app={app} settings={settings} onChange={updateSettings} />;
};

export default WorkspaceApplication;
