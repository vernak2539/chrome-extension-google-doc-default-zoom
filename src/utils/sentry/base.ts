import type { ExtensionFileSource } from "../../types";
import {
  getDefaultTags,
  client as sentryClient,
  scope as sentryScope
} from "./content-script";

export const setupSentry = (source: ExtensionFileSource) => {
  sentryScope.setTags({ source, ...getDefaultTags() });

  return sentryClient;
};
