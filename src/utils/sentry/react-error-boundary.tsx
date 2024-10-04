import { getDefaultIntegrations, Scope } from "@sentry/browser";
import { Component, type ComponentType, type ReactNode } from "react";
import { ErrorFallback } from "src/components/ErrorFallback";
import type { ExtensionFileSource } from "src/types";
import { createSentryClient } from "./base";

type ErrorBoundaryState = {
  hasError: boolean;
};

type ErrorBoundaryProps = {
  fallback: ReactNode;
  children: ReactNode;
  sentryScope: Scope;
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
