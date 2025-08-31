import * as XLSX from 'xlsx'

// Função para exportar dados em formato XLSX
export function downloadXlsx(filename, data, columns = null) {
  try {
    // Se não houver dados, retornar
    if (!data || data.length === 0) {
      console.warn('Nenhum dado para exportar')
      return
    }

    // Se não foram especificadas colunas, usar todas as colunas disponíveis
    let exportData = data
    if (columns && columns.length > 0) {
      exportData = data.map(row => {
        const filteredRow = {}
        columns.forEach(col => {
          if (row.hasOwnProperty(col)) {
            filteredRow[col] = row[col]
          }
        })
        return filteredRow
      })
    }

    // Criar workbook e worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(exportData)

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados')

    // Gerar arquivo e fazer download
    XLSX.writeFile(workbook, filename)
    
    console.log(`Arquivo ${filename} exportado com sucesso`)
  } catch (error) {
    console.error('Erro ao exportar arquivo:', error)
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
