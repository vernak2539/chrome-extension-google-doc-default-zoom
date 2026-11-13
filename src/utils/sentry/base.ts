import { Storage } from "@plasmohq/storage";
import {
  BrowserClient,
  Scope,
  defaultStackParser,
  getDefaultIntegrations,
  makeFetchTransport
} from "@sentry/browser";
import type { BrowserClientOptions } from "@sentry/browser/build/npm/types/client";
import type { ExtensionFileSource } from "src/types";
import { SCHEMA_VERSION_KEY } from "src/utils/storage-migration";

import { SENTRY_BASE_CONFIG, getDefaultTags } from "./config";
import { redactEventRequest } from "./redact-event";

const createNewSentryClient = (
  source: ExtensionFileSource,
  browserClientOptions?: Partial<Omit<BrowserClientOptions, "beforeSend">>
): Scope => {
  const storage = new Storage();
  const extraClientOptions = browserClientOptions || {};

  const sentryClient = new BrowserClient({
    ...SENTRY_BASE_CONFIG,
    stackParser: defaultStackParser,
    integrations: getDefaultIntegrations({}).filter((defaultIntegration) => {
      return !["BrowserApiErrors", "Breadcrumbs", "GlobalHandlers"].includes(
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
  storage.get<number>(SCHEMA_VERSION_KEY).then((version) => {
    sentryScope.setTag("storageSchemaVersion", version ?? 1);
  });

  return sentryScope;
};

export const createSentryClient = createNewSentryClient;
