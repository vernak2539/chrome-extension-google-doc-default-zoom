import {
  BrowserClient,
  Scope,
  defaultStackParser,
  getDefaultIntegrations,
  makeFetchTransport
} from "@sentry/browser";
import type { BrowserClientOptions } from "@sentry/browser/build/npm/types/client";
import type { ExtensionFileSource } from "src/types";
import { SENTRY_BASE_CONFIG, getDefaultTags } from "./config";

const createNewSentryClient = (
  source: ExtensionFileSource,
  browserClientOptions: Partial<BrowserClientOptions>
): Scope => {
  const sentryClient = new BrowserClient({
    ...SENTRY_BASE_CONFIG,
    stackParser: defaultStackParser,
    integrations: getDefaultIntegrations({}).filter((defaultIntegration) => {
      return !["BrowserApiErrors", "Breadcrumbs", "GlobalHandlers"].includes(
        defaultIntegration.name
      );
    }),
    transport: makeFetchTransport,
    ...browserClientOptions
  });

  const sentryScope = new Scope();
  sentryScope.setTags({
    source,
    locale: chrome.i18n.getUILanguage(),
    ...getDefaultTags()
  });
  sentryScope.setClient(sentryClient);

  sentryClient.init(); // initializing has to be done after setting the client on the scope

  return sentryScope;
};

export const createSentryClient = createNewSentryClient;
