import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error in the required JSON snapshot observability format
    const logPayload = {
      error_type: "ReactRenderError",
      source: "frontend",
      timestamp: new Date().toISOString(),
      payload_snapshot: {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      }
    };
    console.error("Global Error Boundary Captured Crash:", JSON.stringify(logPayload, null, 2));
    
    // Optionally post this crash to the backend audit logs if reachable
    fetch('/api/ingestion/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: "web",
        raw_data: {
          type: "support_ticket",
          data: {
            description: `Frontend Crash: ${error.message}. Stack: ${error.stack}`
          }
        }
      })
    }).catch(() => {});
  }

  handleRecovery = () => {
    // Reset state & reload page to restore clean state
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          margin: '2rem auto',
          maxWidth: '600px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fee2e2',
          borderRadius: '8px',
          fontFamily: 'system-ui, sans-serif',
          color: '#991b1b',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: 600 }}>
            ⚠️ System recovered from an error
          </h2>
          <p style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', color: '#7f1d1d', lineHeight: 1.5 }}>
            We've intercepted a runtime crash. The application has been contained safely and is ready to recover.
          </p>
          {this.state.error && (
            <pre style={{
              padding: '1rem',
              backgroundColor: '#fca5a5',
              borderRadius: '4px',
              color: '#7f1d1d',
              fontSize: '0.875rem',
              textAlign: 'left',
              overflowX: 'auto',
              marginBottom: '1.5rem'
            }}>
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleRecovery}
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: '#b91c1c',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#991b1b')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
          >
            Recover & Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
