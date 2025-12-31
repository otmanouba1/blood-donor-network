import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center bg-white rounded-3xl shadow-sm border border-slate-200 p-8 max-w-2xl">
            <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-900 mb-2">
              Component Error
            </h3>
            <p className="text-slate-600 mb-4">
              Error: {this.state.error?.message || 'Unknown error'}
            </p>
            <details className="text-left mb-4 p-4 bg-slate-50 rounded-2xl">
              <summary className="cursor-pointer font-bold text-slate-700 mb-2">Error Details</summary>
              <pre className="text-xs text-slate-600 overflow-auto">
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-3xl transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={18} />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;