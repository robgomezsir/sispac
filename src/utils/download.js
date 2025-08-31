import * as XLSX from 'xlsx'

// Função para exportar dados em formato XLSX
export function downloadXlsx(filename, data, columns = null) {
  try {
    // Se não houver dados, retornar
    if (!data || data.length === 0) {
      console.warn('Nenhum dado para exportar')
      return
    }

    console.log('🔍 [downloadXlsx] Dados recebidos:', data)
    console.log('🔍 [downloadXlsx] Colunas solicitadas:', columns)

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
          console.log(`🔍 [downloadXlsx] Verificando coluna: ${col}, existe: ${row.hasOwnProperty(col)}`)
          if (row.hasOwnProperty(col)) {
            // Usar nome amigável se disponível, senão usar o nome original
            const friendlyName = columnMapping[col] || col
            filteredRow[friendlyName] = row[col]
            console.log(`✅ [downloadXlsx] Adicionada coluna: ${friendlyName} = ${row[col]}`)
          } else {
            console.log(`❌ [downloadXlsx] Coluna não encontrada: ${col}`)
          }
        })
        return filteredRow
      })
    }

    console.log('🔍 [downloadXlsx] Dados finais para exportação:', exportData)

    // Criar workbook e worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(exportData)

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
