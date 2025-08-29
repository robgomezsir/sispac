import * as XLSX from 'xlsx'

export function downloadXlsx(filename, rows, columns=null){
  const data = columns ? rows.map(r => {
    const o = {}
    for(const c of columns){ o[c] = r[c] }
    return o
  }) : rows
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Dados')
  XLSX.writeFile(wb, filename)
}
