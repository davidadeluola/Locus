import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null, ownerStack: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log safely and call optional callback
    try {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught', error, info);
    } catch (e) {
      // ignore logging failures
    }

    try {
      if (typeof this.props.onError === 'function') this.props.onError(error, info);
    } catch (e) {
      // ignore
    }

    // Capture owner stack in dev builds if available
    try {
      if (process.env.NODE_ENV !== 'production' && typeof React.captureOwnerStack === 'function') {
        // captureOwnerStack may throw in some builds; guard it
        const ownerStack = React.captureOwnerStack();
        this.setState({ ownerStack });
      }
    } catch (e) {
      // ignore
    }

    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const message = this.state.error?.message || 'An unexpected error occurred.';
      const componentStack = this.state.info?.componentStack || this.state.ownerStack || '';

      return (
        <div className="bg-red-900/10 border border-red-800 p-6 rounded-lg">
          <h3 className="text-red-400 font-semibold mb-2">An unexpected error occurred</h3>
          <pre className="text-xs text-zinc-300 overflow-auto max-h-48">{String(message)}</pre>
          {componentStack && (
            <details className="text-xs text-zinc-400 mt-2">
              <summary>Show component stack</summary>
              <pre className="text-xs text-zinc-400 overflow-auto max-h-64">{componentStack}</pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
