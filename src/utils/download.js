import * as XLSX from 'xlsx'

// Função para exportar dados em formato XLSX
export function downloadXlsx(filename, data, columns = null) {
  try {
    // Se não houver dados, retornar
    if (!data || data.length === 0) {
      console.warn('Nenhum dado para exportar')
      return
    }

    // Mapeamento de nomes de colunas para nomes amigáveis
    const columnMapping = {
      'id': 'ID',
      'name': 'Nome',
      'email': 'Email',
      'score': 'Pontuação',
      'status': 'Status',
      'behavioral_profile': 'Análise de Perfil Comportamental',
      'answers': 'Respostas do Questionário',
      'created_at': 'Data de Criação'
    }

    // Processar dados para exportação
    let exportData = data.map(row => {
      const processedRow = {}
      
      // Se não foram especificadas colunas, usar todas as colunas disponíveis
      const columnsToProcess = columns && columns.length > 0 ? columns : Object.keys(row)
      
      columnsToProcess.forEach(col => {
        if (row.hasOwnProperty(col)) {
          if (col === 'behavioral_profile' && row[col] && typeof row[col] === 'object') {
            // Processar perfil comportamental - criar colunas separadas para cada seção
            const profile = row[col]
            
            // Adicionar cada seção como uma coluna separada
            processedRow['Perfil'] = profile.perfil || ''
            processedRow['Comportamento'] = profile.comportamento || ''
            processedRow['Competências'] = profile.competencias || ''
            processedRow['Liderança'] = profile.lideranca || ''
            processedRow['Áreas de Desenvolvimento'] = Array.isArray(profile.areas_desenvolvimento) 
              ? profile.areas_desenvolvimento.join('; ') 
              : profile.areas_desenvolvimento || ''
            processedRow['Visão Estratégica'] = profile.visao_estrategica || ''
            processedRow['Recomendações'] = profile.recomendacoes || ''
          } else if (col === 'answers') {
            // Processar respostas do questionário
            if (row[col] && typeof row[col] === 'object') {
              const answers = row[col]
              let formattedAnswers = ''
              
              // Processar cada questão
              Object.keys(answers).forEach(questionId => {
                const questionAnswers = answers[questionId]
                if (Array.isArray(questionAnswers) && questionAnswers.length > 0) {
                  formattedAnswers += `Questão ${questionId}: ${questionAnswers.join('; ')}\n`
                }
              })
              
              processedRow[columnMapping[col] || col] = formattedAnswers.trim()
            } else {
              processedRow[columnMapping[col] || col] = 'Nenhuma resposta disponível'
            }
          } else if (col === 'created_at') {
            // Formatar data
            processedRow[columnMapping[col] || col] = new Date(row[col]).toLocaleDateString('pt-BR')
          } else {
            // Usar nome amigável se disponível, senão usar o nome original
            const friendlyName = columnMapping[col] || col
            processedRow[friendlyName] = row[col]
          }
        }
      })
      
      return processedRow
    })

    // Criar workbook e worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(exportData)

    // Ajustar largura das colunas automaticamente
    const columnWidths = []
    const headers = Object.keys(exportData[0] || {})
    
    headers.forEach(header => {
      // Calcular largura baseada no conteúdo
      let maxWidth = header.length
      
      exportData.forEach(row => {
        const cellValue = String(row[header] || '')
        maxWidth = Math.max(maxWidth, cellValue.length)
      })
      
      // Limitar largura máxima e mínima
      columnWidths.push({
        wch: Math.min(Math.max(maxWidth + 2, 15), 50)
      })
    })
    
    worksheet['!cols'] = columnWidths

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados')

    // Gerar arquivo e fazer download
    XLSX.writeFile(workbook, filename)
    
    console.log(`✅ Arquivo ${filename} exportado com sucesso`)
    console.log(`📊 Colunas exportadas:`, Object.keys(exportData[0] || {}))
  } catch (error) {
    console.error('❌ Erro ao exportar arquivo:', error)
    throw new Error('Falha ao exportar arquivo')
  }
}

// Função para exportar dados específicos de um candidato
export function downloadCandidateData(candidate, columns = null) {
  const filename = `candidato_${candidate.id || 'dados'}.xlsx`
  downloadXlsx(filename, [candidate], columns)
}

// Função para exportar lista completa de candidatos
export function downloadCandidatesList(candidates, columns = null) {
  const filename = 'candidatos.xlsx'
  downloadXlsx(filename, candidates, columns)
}
