class Logger {
  private workspaceApp: string;

  constructor(name: string) {
    this.workspaceApp = name;
  }

  info(msg) {
    console.log(`Google Workspace Zoom Default: ${msg}`);
  }
}

export default Logger;
