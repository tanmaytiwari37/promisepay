import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetErrorBoundary);
      }
      const isDev = import.meta.env?.DEV === true;
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)', color: '#f87171' }}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-primary-text mb-2">Something went wrong</h3>
            <p className="text-secondary-text text-sm mb-4">This component failed to render.</p>
            {isDev && (
              <details className="text-left text-xs font-mono mb-4" style={{ color: '#64748b', maxWidth: '600px', textAlign: 'left' }}>
                <summary className="cursor-pointer mb-2 text-primary-text font-bold">Error Details (Development Mode)</summary>
                <div className="space-y-3">
                  <div>
                    <span className="font-bold">Message:</span>
                    <pre className="whitespace-pre-wrap mt-1 p-2 rounded" style={{ background: 'rgba(15,30,50,0.5)', border: '1px solid rgba(148,163,184,0.15)', overflow: 'auto' }}>
                      {this.state.error?.message || 'No error message'}
                    </pre>
                  </div>
                  <div>
                    <span className="font-bold">Component Stack:</span>
                    <pre className="whitespace-pre-wrap mt-1 p-2 rounded" style={{ background: 'rgba(15,30,50,0.5)', border: '1px solid rgba(148,163,184,0.15)', overflow: 'auto', maxHeight: '300px' }}>
                      {this.state.errorInfo?.componentStack || 'No component stack available'}
                    </pre>
                  </div>
                </div>
              </details>
            )}
            <button
              onClick={this.resetErrorBoundary}
              className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{ background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', color: '#07111f' }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };
}

export default ErrorBoundary;