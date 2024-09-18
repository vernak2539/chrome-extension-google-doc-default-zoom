import { Component } from "react";
import type { ExtensionFileSource } from "../../types";
import {
  getDefaultTags,
  client as sentryClient,
  scope as sentryScope
} from "./setup";

type ErrorBoundaryState = {
  hasError: boolean;
};

type ErrorBoundaryProps = {
  fallback: React.ReactNode;
  children: React.ReactNode;
  beforeCapture?: (scope: typeof sentryScope) => void;
};

class ErrorBoundaryWithSentry extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (this.props.beforeCapture) {
      this.props.beforeCapture(sentryScope);
    }

    sentryClient.captureException(error, {
      ...{
        mechanism: {
          handled: Boolean(this.props.fallback)
        }
      },
      captureContext: {
        contexts: {
          react: { componentStack: info.componentStack }
        }
      }
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export const setupSentry = (source: ExtensionFileSource) => {
  sentryScope.setTags({ source, ...getDefaultTags() });

  return ErrorBoundaryWithSentry;
};
