import { getDefaultIntegrations } from "@sentry/browser";
import { Component } from "react";
import { createSentryClient } from "./base";

type ErrorBoundaryState = {
  hasError: boolean;
};

type ErrorBoundaryProps = {
  fallback: React.ReactNode;
  children: React.ReactNode;
};

const sentryScope = createSentryClient("popup", {
  integrations: getDefaultIntegrations({})
});

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
    sentryScope.captureException(error, {
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

export default ErrorBoundaryWithSentry;
