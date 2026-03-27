import { Component } from 'react';
import { Link } from 'react-router-dom';

/**
 * Catches render/lifecycle errors in the component tree and shows a fallback UI
 * instead of crashing the whole page.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="h-full flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-red-900/30 border border-red-500/30 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <h2 className="text-lg font-semibold text-red-300 mb-2">Something went wrong</h2>
            <p className="text-sm text-red-200/70 mb-4 font-mono break-words">
              {this.state.error.message}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => this.setState({ error: null })}
                className="px-4 py-2 bg-red-700/50 hover:bg-red-700/70 text-red-200 text-sm rounded-lg transition-colors"
              >
                Try again
              </button>
              <Link
                to="/"
                className="px-4 py-2 bg-surface-600 hover:bg-surface-500 text-gray-300 text-sm rounded-lg transition-colors"
                onClick={() => this.setState({ error: null })}
              >
                Back to Gallery
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
