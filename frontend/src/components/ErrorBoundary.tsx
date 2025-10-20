import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '50px auto' }}>
          <h1 style={{ color: 'red' }}>Something went wrong</h1>
          <details style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
            <summary>Error Details</summary>
            <p>{this.state.error?.toString()}</p>
            <p>{this.state.error?.stack}</p>
          </details>
          <button
            onClick={() => window.location.href = '/'}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Go to Homepage
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
