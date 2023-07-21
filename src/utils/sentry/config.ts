import type { BrowserOptions } from "@sentry/browser"
import packageJson from "../../../package.json"

export const sentryConfig: BrowserOptions = {
  dsn: process.env.PLASMO_PUBLIC_SENTRY_DSN,
  integrations: [],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  release: `${packageJson.name}@${packageJson.version}`
}
