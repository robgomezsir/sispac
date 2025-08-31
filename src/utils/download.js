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
      'created_at': 'Data de Criação'
    }

    // Se não foram especificadas colunas, usar todas as colunas disponíveis
    let exportData = data
    if (columns && columns.length > 0) {
      exportData = data.map(row => {
        const filteredRow = {}
        columns.forEach(col => {
          if (row.hasOwnProperty(col)) {
            // Usar nome amigável se disponível, senão usar o nome original
            const friendlyName = columnMapping[col] || col
            let value = row[col]
            
            // Formatação especial para perfil comportamental
            if (col === 'behavioral_profile' && typeof value === 'string') {
              // Garantir que quebras de linha sejam preservadas no Excel
              // Usar quebras de linha do Windows para melhor compatibilidade
              value = value.replace(/\n/g, '\r\n')
              
              // Adicionar espaçamento extra para melhor legibilidade
              value = value.replace(/([A-ZÇÃÂÁÀÉÊÍÓÔÕÚÛ]+:)/g, '\r\n$1')
            }
            
            filteredRow[friendlyName] = value
          }
        })
        return filteredRow
      })
    }

    // Criar workbook e worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(exportData)

    // Configurar largura das colunas automaticamente
    const columnWidths = []
    const headers = Object.keys(exportData[0] || {})
    
    headers.forEach((header, index) => {
      let maxWidth = header.length
      
      // Verificar o conteúdo de cada linha para determinar a largura máxima
      exportData.forEach(row => {
        const cellValue = String(row[header] || '')
        const cellLength = cellValue.length
        if (cellLength > maxWidth) {
          maxWidth = cellLength
        }
      })
      
      // Largura especial para coluna de perfil comportamental
      if (header === 'Análise de Perfil Comportamental') {
        maxWidth = Math.max(maxWidth, 80) // Largura mínima para perfil
      } else {
        maxWidth = Math.min(maxWidth, 50) // Limitar largura de outras colunas
      }
      
      columnWidths[index] = { wch: maxWidth }
    })
    
    worksheet['!cols'] = columnWidths

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados')

    // Gerar arquivo e fazer download
    XLSX.writeFile(workbook, filename)
    
    console.log(`✅ Arquivo ${filename} exportado com sucesso`)
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
