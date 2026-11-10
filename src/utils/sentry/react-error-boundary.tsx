import { getDefaultIntegrations, Scope } from "@sentry/browser";
import { Component, type ComponentType, type ErrorInfo, type ReactNode } from "react";
import { ErrorFallback } from "src/components/ErrorFallback";
import type { ExtensionFileSource } from "src/types";

import { LoggerContext } from "../logger/context";
import { createSentryClient } from "./base";

type ErrorBoundaryState = {
  hasError: boolean;
};

type ErrorBoundaryProps = {
  fallback: ReactNode;
  children: ReactNode;
  sentryScope: Scope;
};

class ErrorBoundaryWithSentry extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static contextType = LoggerContext;

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.sentryScope.captureException(error, {
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

    // Log after reporting, so a logging failure can never block the Sentry report or the fallback
    try {
      const logger = this.context as React.ContextType<typeof LoggerContext>;
      logger?.error("React error boundary caught an error", error);
    } catch {
      // intentionally ignored: see above
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export const setupSentryReactErrorBoundary = (source: ExtensionFileSource) => {
  const sentryScope = createSentryClient(source, {
    integrations: getDefaultIntegrations({})
  });

  return (WrappedComponent: ComponentType, fallbackHeading: string) => {
    return () => (
      <ErrorBoundaryWithSentry
        sentryScope={sentryScope}
        fallback={<ErrorFallback heading={fallbackHeading} />}>
        <WrappedComponent />
      </ErrorBoundaryWithSentry>
    );
  };
};
