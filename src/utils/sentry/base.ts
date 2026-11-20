import {
  BrowserClient,
  Scope,
  defaultStackParser,
  getDefaultIntegrations,
  makeFetchTransport
} from "@sentry/browser";
import type { ExtensionFileSource } from "src/types";
import { readStoredValue, SCHEMA_VERSION_KEY } from "src/utils/storage";

import { SENTRY_BASE_CONFIG, getDefaultTags } from "./config";
import { redactEventRequest } from "./redact-event";

type BrowserClientOptions = ConstructorParameters<typeof BrowserClient>[0];

const createNewSentryClient = (
  source: ExtensionFileSource,
  browserClientOptions?: Partial<Omit<BrowserClientOptions, "beforeSend">>
): Scope => {
  const extraClientOptions = browserClientOptions || {};

  const sentryClient = new BrowserClient({
    ...SENTRY_BASE_CONFIG,
    // WXT copies the package.json version into the manifest, and the release workflow names the Sentry
    // release with that same version, so uploaded source maps match.
    release: chrome?.runtime?.getManifest?.().version,
    stackParser: defaultStackParser,
    integrations: getDefaultIntegrations({}).filter((defaultIntegration) => {
      // Dedupe drops an event equal to the previous one of the same client. A client that lives in
      // the background worker serves many tabs, and each failure must still be counted.
      return !["BrowserApiErrors", "Breadcrumbs", "Dedupe", "GlobalHandlers"].includes(
        defaultIntegration.name
      );
    }),
    transport: makeFetchTransport,
    ...extraClientOptions,
    // Last on purpose: callers can't override it. Strips the Docs/Sheets URL and the referrer that
    // HttpContext adds to every event (issue #112).
    beforeSend: (event) => redactEventRequest(event)
  });

  const sentryScope = new Scope();
  sentryScope.setTags({
    source,
    locale: chrome?.i18n?.getUILanguage?.() || "en",
    ...getDefaultTags()
  });
  sentryScope.setClient(sentryClient);

  sentryClient.init(); // initializing has to be done after setting the client on the scope

  // set schema version... async should be fine as it will be quick, but there are potentials for race conditions
  readStoredValue<number>(SCHEMA_VERSION_KEY).then((version) => {
    sentryScope.setTag("storageSchemaVersion", version ?? 1);
  });

  return sentryScope;
};

export const createSentryClient = createNewSentryClient;
