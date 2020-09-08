import React from 'react';

class ErrorBoundary extends React.Component<{fallback: React.ReactNode}, {hasError: boolean; error: Error | null}> {
    state = {
        hasError: false,
        error: null
    };

    static getDerivedStateFromError(error: Error) {
        return {
            hasError: true,
            error
        };
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
