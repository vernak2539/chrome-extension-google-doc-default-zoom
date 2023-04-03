import * as Sentry from "@sentry/react"

import type { ExtensionFileSource } from "~types"

import packageJson from "../../package.json"

export const setupSentry = (source: ExtensionFileSource) => {
  Sentry.init({
    dsn: process.env.PLASMO_PUBLIC_SENTRY_DSN,
    integrations: [],

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
    release: `${packageJson.name}@${packageJson.version}`
  })

  Sentry.configureScope((scope) => {
    scope.setTags({ source })
  })
}
