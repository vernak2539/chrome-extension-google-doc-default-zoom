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

const createNewSentryClient = (
  source: ExtensionFileSource,
  browserClientOptions?: Partial<BrowserClientOptions>
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
    ...extraClientOptions
  });

  const sentryScope = new Scope();
  sentryScope.setTags({
    source,
    locale: chrome.i18n.getUILanguage(),
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
