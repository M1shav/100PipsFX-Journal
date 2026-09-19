import React from 'react';

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null, info: any}> {
  state = { hasError: false, error: null, info: null };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: any) { this.setState({ error, info }); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#330000', color: 'white', fontFamily: 'monospace' }}>
          <h2>FATAL REACT CRASH</h2>
          <p>{this.state.error?.toString()}</p>
          <pre>{this.state.info?.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}