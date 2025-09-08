import React, { useState, useEffect } from 'react'
import { testConnectivity, checkSupabaseHealth } from '../lib/supabase'
import { Button } from '../ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx'
import { Badge } from '../ui/badge.jsx'
import { Wifi, WifiOff, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'

export default function ConnectivityDiagnostic({ onClose }) {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState({
    basicConnectivity: null,
    supabaseHealth: null,
    timestamp: null
  })

  const runDiagnostic = async () => {
    setIsRunning(true)
    setResults({
      basicConnectivity: null,
      supabaseHealth: null,
      timestamp: null
    })

    try {
      // Teste de conectividade básica
      console.log('🔍 [Diagnostic] Testando conectividade básica...')
      const basicResult = await testConnectivity()
      
      // Teste de saúde do Supabase
      console.log('🔍 [Diagnostic] Testando saúde do Supabase...')
      const healthResult = await checkSupabaseHealth()

      setResults({
        basicConnectivity: basicResult,
        supabaseHealth: healthResult,
        timestamp: new Date().toLocaleString()
      })
    } catch (error) {
      console.error('❌ [Diagnostic] Erro no diagnóstico:', error)
      setResults({
        basicConnectivity: false,
        supabaseHealth: false,
        timestamp: new Date().toLocaleString()
      })
    } finally {
      setIsRunning(false)
    }
  }

  useEffect(() => {
    runDiagnostic()
  }, [])

  const getStatusIcon = (status) => {
    if (status === null) return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    if (status) return <CheckCircle className="w-4 h-4 text-green-500" />
    return <XCircle className="w-4 h-4 text-red-500" />
  }

  const getStatusBadge = (status) => {
    if (status === null) return <Badge variant="secondary">Testando...</Badge>
    if (status) return <Badge variant="default" className="bg-green-500">OK</Badge>
    return <Badge variant="destructive">Falha</Badge>
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              <CardTitle>Diagnóstico de Conectividade</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Verificando a conectividade com o servidor Supabase
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Conectividade Básica */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              {getStatusIcon(results.basicConnectivity)}
              <div>
                <p className="font-medium">Conectividade Básica</p>
                <p className="text-sm text-muted-foreground">
                  Teste de conexão com o servidor
                </p>
              </div>
            </div>
            {getStatusBadge(results.basicConnectivity)}
          </div>

          {/* Saúde do Supabase */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              {getStatusIcon(results.supabaseHealth)}
              <div>
                <p className="font-medium">Saúde do Supabase</p>
                <p className="text-sm text-muted-foreground">
                  Teste de consulta ao banco de dados
                </p>
              </div>
            </div>
            {getStatusBadge(results.supabaseHealth)}
          </div>

          {/* Timestamp */}
          {results.timestamp && (
            <div className="text-xs text-muted-foreground text-center">
              Último teste: {results.timestamp}
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={runDiagnostic} 
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Testar Novamente
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>

          {/* Recomendações */}
          {results.basicConnectivity === false && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Problema de Conectividade</p>
                  <p className="text-yellow-700">
                    Verifique sua conexão com a internet e tente novamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {results.basicConnectivity === true && results.supabaseHealth === false && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800">Problema no Servidor</p>
                  <p className="text-orange-700">
                    A conexão está OK, mas há problemas no servidor. Tente novamente em alguns minutos.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
