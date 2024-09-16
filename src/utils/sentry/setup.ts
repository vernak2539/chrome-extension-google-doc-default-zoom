// https://docs.sentry.io/platforms/javascript/best-practices/shared-environments/
import {
  BrowserClient,
  defaultStackParser,
  getDefaultIntegrations,
  makeFetchTransport,
  Scope
} from "@sentry/browser";
import packageJson from "../../../package.json";

// filter integrations that use the global variable
const integrations = getDefaultIntegrations({}).filter((defaultIntegration) => {
  return !["BrowserApiErrors", "Breadcrumbs", "GlobalHandlers"].includes(
    defaultIntegration.name
  );
});

const sentryClient = new BrowserClient({
  dsn: process.env.PLASMO_PUBLIC_SENTRY_DSN,
  stackParser: defaultStackParser,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || "development",
  release: packageJson.version,
  ignoreErrors: [
    /^Detached while handling command.$/,
    /^Cannot access a chrome-extension:\/\/ URL of different extension$/,
    /^Cannot access a chrome:\/\/ URL$/
  ],
  integrations,
  transport: makeFetchTransport
});

const sentryScope = new Scope();
sentryScope.setClient(sentryClient);

sentryClient.init(); // initializing has to be done after setting the client on the scope

export const scope = sentryScope;
export const client = sentryClient;
export const getDefaultTags = () => ({
  extension: packageJson.name
});
