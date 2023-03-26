class Logger {
  private workplaceApp: string

  constructor(name: string) {
    this.workplaceApp = name
  }

  info(msg) {
    console.log(`Google Workspace Zoom Default: ${msg}`)
  }
}

export default Logger
