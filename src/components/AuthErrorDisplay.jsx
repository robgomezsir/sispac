import React from 'react'

const AuthErrorDisplay = ({ error, onClear, onRetry, isLoading = false }) => {
  if (!error) return null

  const getErrorIcon = (errorMessage) => {
    if (errorMessage.includes('conexão') || errorMessage.includes('internet')) {
      return (
        <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    }
    
    if (errorMessage.includes('sessão') || errorMessage.includes('expirada')) {
      return (
        <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
    
    return (
      <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  const getErrorColor = (errorMessage) => {
    if (errorMessage.includes('conexão') || errorMessage.includes('internet')) {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }
    
    if (errorMessage.includes('sessão') || errorMessage.includes('expirada')) {
      return 'bg-red-50 border-red-200 text-red-800'
    }
    
    return 'bg-red-50 border-red-200 text-red-800'
  }

  const getErrorTitle = (errorMessage) => {
    if (errorMessage.includes('conexão') || errorMessage.includes('internet')) {
      return 'Problema de Conexão'
    }
    
    if (errorMessage.includes('sessão') || errorMessage.includes('expirada')) {
      return 'Sessão Expirada'
    }
    
    return 'Erro de Autenticação'
  }

  return (
    <div className={`rounded-md p-4 border ${getErrorColor(error)}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {getErrorIcon(error)}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {getErrorTitle(error)}
          </h3>
          <div className="mt-2 text-sm">
            <p>{error}</p>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Tentando...
                  </>
                ) : (
                  'Tentar Novamente'
                )}
              </button>
            )}
            
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center px-3 py-2 border border-input text-sm leading-4 font-medium rounded-md text-foreground bg-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Fechar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthErrorDisplay
