// This is used in both content and background scripts. Do not use this in the popup.
import {
  BrowserClient,
  Scope,
  defaultStackParser,
  getDefaultIntegrations,
  makeFetchTransport
} from "@sentry/browser";
import type { ExtensionFileSource } from "src/types";
import { SENTRY_BASE_CONFIG, getDefaultTags } from "./config";

const createNewSentryClient = (source: ExtensionFileSource) => {
  const sentryClient = new BrowserClient({
    ...SENTRY_BASE_CONFIG,
    stackParser: defaultStackParser,
    integrations: getDefaultIntegrations({}).filter((defaultIntegration) => {
      return !["BrowserApiErrors", "Breadcrumbs", "GlobalHandlers"].includes(
        defaultIntegration.name
      );
    }),
    transport: makeFetchTransport
  });

  const sentryScope = new Scope();
  sentryScope.setTags({
    source,
    locale: chrome.i18n.getUILanguage(),
    ...getDefaultTags()
  });
  sentryScope.setClient(sentryClient);

  sentryClient.init(); // initializing has to be done after setting the client on the scope

  return sentryClient;
};

export const createSentryClient = createNewSentryClient;
