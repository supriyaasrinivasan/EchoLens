import React from 'react';
import { RiErrorWarningLine, RiRefreshLine } from '@remixicon/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-content">
            <RiErrorWarningLine size={64} className="error-icon" />
            <h2>Something went wrong</h2>
            <p>We encountered an unexpected error. Don't worry, your data is safe.</p>
            
            {this.state.error && (
              <div className="error-details">
                <strong>Error:</strong> {this.state.error.toString()}
              </div>
            )}
            
            <button onClick={this.handleReset} className="error-reset-button">
              <RiRefreshLine size={18} />
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
