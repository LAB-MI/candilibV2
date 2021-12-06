
import ExcelJS from 'exceljs'
import { triggerDownloadByLink } from './download'

export const generateExcelFile = async ({ national, byDepartement, selectedRange, isByHomeDepartement }) => {
  const date = new Date()
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'admin'
  workbook.lastModifiedBy = 'admin'
  workbook.created = date
  workbook.modified = date
  const statsType = `${isByHomeDepartement ? 'Dpt-Resid' : 'Dpt-Resa'}`

  const templateTmp = [
    { header: 'Groupe', key: 'groupe' },
    { header: 'Reservation', key: 'reservation' },
    { header: 'Modification', key: 'modification' },
    { header: 'Annulation', key: 'annulation' },
    { header: 'Date', key: 'date' },
  ]

  let nationalSheet = false
  let byDepartementSheet = false
  if (national.length) {
    nationalSheet = workbook.addWorksheet(`${statsType}_stats_national`)

    const nationalLogsColumns = [
      ...templateTmp,
    ]

    nationalSheet.columns = nationalLogsColumns

    national.forEach(rowValue => {
      nationalSheet.addRow(rowValue)
    })
  }

  if (byDepartement.length) {
    byDepartementSheet = workbook.addWorksheet(`${statsType}_stats_departement`)
    const byDepartementLogsColumns = [
      { header: 'Departement', key: 'departement' },
      ...templateTmp,
    ]
    byDepartementSheet.columns = byDepartementLogsColumns
    byDepartement.forEach(rowValue => {
      byDepartementSheet.addRow(rowValue)
    })
  }

  if (!national.length && !byDepartement.length) {
    throw new Error('Certaine stats vides')
  }

  const data = await workbook.xlsx.writeBuffer()

  const filename = `${selectedRange}_${statsType}_infos_actions_candidats.xlsx`
  var blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)

  triggerDownloadByLink(url, filename)
  return {
    filename,
    url,
  }
}

export const generateExcelCandidatListFile = async ({ departement, candidats }) => {
  if (!departement) {
    throw new Error(`Departement "${departement}" est invalide`)
  }

  if (!candidats.length) {
    throw new Error(`Departement "${departement}" est invalide`)
  }
  const date = new Date()
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'admin'
  workbook.lastModifiedBy = 'admin'
  workbook.created = date
  workbook.modified = date
  const candidatListTitle = `Candidats_du_departement_${departement}`

  const templateTmp = [
    { header: 'Prenom', key: 'prenom' },
    { header: 'Nom', key: 'nom' },
    { header: 'Neph', key: 'codeNeph' },
  ]

  let candidatListSheet = null
  if (!departement || candidats.length) {
    candidatListSheet = workbook.addWorksheet(candidatListTitle)

    const candidatListColumns = [
      ...templateTmp,
    ]

    candidatListSheet.columns = candidatListColumns

    candidats.forEach(rowValue => {
      candidatListSheet.addRow(rowValue)
    })
  }

  const data = await workbook.xlsx.writeBuffer()
  // TODO: Update filename
  const filename = `${departement}_candidats.xlsx`
  var blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)

  triggerDownloadByLink(url, filename)
  return {
    filename,
    url,
  }
}
