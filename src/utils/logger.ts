class Logger {
  private workspaceApp: string;

  constructor(name: string) {
    this.workspaceApp = name;
  }

  info(msg) {
    console.log(`Default zoom for Google Workspace: ${msg}`);
  }
}

export default Logger;
