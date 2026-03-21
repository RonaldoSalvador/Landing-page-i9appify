import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
                    <h1 className="text-3xl font-bold mb-4 text-red-500">Opa! Algo deu errado. 💥</h1>
                    <p className="mb-6 text-gray-400">Ocorreu um erro inesperado na aplicação.</p>

                    <div className="bg-black/50 p-6 rounded-xl border border-red-500/30 max-w-2xl w-full overflow-auto">
                        <h2 className="text-xl font-bold mb-2">Detalhes do Erro:</h2>
                        <pre className="text-red-400 whitespace-pre-wrap font-mono text-sm">
                            {this.state.error && this.state.error.toString()}
                        </pre>
                        <br />
                        <details className="text-gray-500 text-xs">
                            <summary className="cursor-pointer hover:text-white">Stack Trace</summary>
                            <pre className="mt-2 whitespace-pre-wrap">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    </div>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-8 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium transition-colors"
                    >
                        Voltar para Home
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
