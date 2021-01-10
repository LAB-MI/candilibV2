
import ExcelJS from 'exceljs'
import { triggerDownloadByLink } from './download'

export const generateExcelFile = ({ national, byDepartement }) => {
  if (!national.length || !byDepartement.length) {
    return false
  }
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'admin'
  workbook.lastModifiedBy = 'admin'
  workbook.created = new Date()
  workbook.modified = new Date()
  const nationalSheet = workbook.addWorksheet('stats national')
  const byDepartementSheet = workbook.addWorksheet('stats par departement')

  const nationalLogsColumns = [
    { header: 'Groupe', key: 'groupe' },
    { header: 'Reservation', key: 'reservation' },
    { header: 'Modification', key: 'modification' },
    { header: 'Annulation', key: 'annulation' },
    { header: 'Date', key: 'date' },
  ]

  const byDepartementLogsColumns = [
    { header: 'Departement', key: 'departement' },
    { header: 'Groupe', key: 'groupe' },
    { header: 'Reservation', key: 'reservation' },
    { header: 'Modification', key: 'modification' },
    { header: 'Annulation', key: 'annulation' },
    { header: 'Date', key: 'date' },
  ]

  nationalSheet.columns = nationalLogsColumns
  byDepartementSheet.columns = byDepartementLogsColumns

  national.forEach(rowValue => {
    nationalSheet.addRow(rowValue)
  })

  byDepartement.forEach(rowValue => {
    byDepartementSheet.addRow(rowValue)
  })

  workbook.xlsx.writeBuffer().then(function (data) {
    const filename = 'fileName.xlsx'
    var blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)

    triggerDownloadByLink(url, filename)
    return {
      filename,
      url,
    }
  })
}
