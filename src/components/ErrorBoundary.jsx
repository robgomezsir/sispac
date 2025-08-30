import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isRecovering: false
    }
  }

  static getDerivedStateFromError(error) {
    // Atualizar o estado para que a próxima renderização mostre a UI de fallback
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log do erro para debugging
    console.error('❌ [ErrorBoundary] Erro capturado:', error)
    console.error('❌ [ErrorBoundary] Stack trace:', errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Em produção, enviar para serviço de monitoramento
    if (!import.meta.env.DEV) {
      // Aqui você pode integrar com Sentry, LogRocket, etc.
      console.error('❌ [ErrorBoundary] Erro em produção:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      })
    }
  }

  handleRetry = () => {
    this.setState({ isRecovering: true })
    
    // Tentar recarregar a aplicação
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  handleClearError = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isRecovering: false
    })
  }

  render() {
    if (this.state.hasError) {
      // UI de fallback personalizada
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card text-card-foreground rounded-lg border shadow-lg p-6 text-center">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10">
                <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-2">
              Algo deu errado
            </h3>
            
            <p className="text-muted-foreground text-sm mb-4">
              Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <div className="mt-2 p-3 bg-muted rounded text-xs font-mono text-destructive overflow-auto max-h-32">
                  <div><strong>Mensagem:</strong> {this.state.error.message}</div>
                  {this.state.errorInfo?.componentStack && (
                    <div className="mt-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                disabled={this.state.isRecovering}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {this.state.isRecovering ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Recarregando...
                  </>
                ) : (
                  'Tentar Novamente'
                )}
              </button>
              
              {import.meta.env.DEV && (
                <button
                  onClick={this.handleClearError}
                  className="inline-flex items-center px-4 py-2 border border-input text-sm font-medium rounded-md text-foreground bg-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Limpar Erro
                </button>
              )}
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              Se o problema persistir, entre em contato com o suporte.
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
