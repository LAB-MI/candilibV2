
import ExcelJS from 'exceljs'
import { triggerDownloadByLink } from './download'

export const msgNational = 'Donnée national vide'
export const msgByDepartement = 'Donnée par département vide'

export const generateExcelFile = async ({ national, byDepartement, selectedRange }) => {
  if (!national.length) {
    throw new Error(msgNational)
  }

  if (!byDepartement.length) {
    throw new Error(msgByDepartement)
  }
  const date = new Date()
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'admin'
  workbook.lastModifiedBy = 'admin'
  workbook.created = date
  workbook.modified = date
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

  const data = await workbook.xlsx.writeBuffer()

  const filename = `infos_actions_candidats_${selectedRange}.xlsx`
  var blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)

  triggerDownloadByLink(url, filename)
  return {
    filename,
    url,
  }
}
