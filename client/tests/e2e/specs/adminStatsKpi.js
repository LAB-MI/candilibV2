/* Tests :
  candidate nonReussite stats
  candidate no receivable
  candidate no examinable
  candidate absent
  candidate success
*/
import { date1, now } from '../support/dateUtils'
describe('Stats Kpi tests', () => {
  let nbPlaces = 0
  const nowIn1WeekAnd1DaysBefore01 = date1.plus({ days: 1 })
  const nowIn1WeekAnd1DaysBefore02 = date1.plus({ days: 2 })
  const nowIn1WeekAnd1DaysBefore03 = date1.plus({ days: 3 })
  beforeEach(() => {
    cy.deleteAllMails()
    cy.adminLogin()

    cy.addPlanning([
      nowIn1WeekAnd1DaysBefore01,
      nowIn1WeekAnd1DaysBefore02,
      nowIn1WeekAnd1DaysBefore03,
    ]).its('avalaiblePlaces').then(el => {
      nbPlaces = el
    })

    cy.adminDisconnection()
    cy.updatePlaces({}, { createdAt: now.minus({ days: 2 }).toUTC() }, true)
  })

  const nbInscrits = 4
  const nbBooked = 1
  let nbExams = 0
  let nbNotExamined = 0
  let nbFailed = 0

  it('Checks candidate nonReussite stats', () => {
    cy.adminLogin()
    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + nowIn1WeekAnd1DaysBefore03.toFormat('yyyy-MM-dd')).wait(500)

    cy.get('.t-remplissage-futur')
      .should('contain', '0.00%')

    cy.get('.t-number-inscrit-' + nbInscrits)
      .should('have.length', 1)

    cy.get('.t-number-future-free-places-' + nbPlaces)
      .should('have.length', 1)

    cy.addCandidatToPlace(undefined, 'CANDIDAT_STATS_KPI')

    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + nowIn1WeekAnd1DaysBefore03.toFormat('yyyy-MM-dd')).wait(500)

    cy.get('.t-number-inscrit-' + (nbInscrits - nbBooked))
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + (nbPlaces - nbBooked))
      .should('have.length', 1)
    cy.get('.t-remplissage-futur')
      .should('contain', Number(nbBooked / nbPlaces * 100).toFixed(2))

    cy.get('.v-snack--active button').should('be.visible').click({ force: true })
    cy.writeFile(Cypress.env('filePath') + '/aurige.nonReussite.json',
      [
        {
          codeNeph: Cypress.env('candidatStatsKpiNeph'),
          nomNaissance: Cypress.env('candidatStatsKpi'),
          email: Cypress.env('emailCandidatStatsKpi'),
          dateReussiteETG: new Date(),
          nbEchecsPratiques: '0',
          dateDernierNonReussite: Cypress.env('placeDate'),
          objetDernierNonReussite: 'Echec',
          reussitePratique: '',
          candidatExistant: 'OK',
        },
      ])
    cy.contains('import_export')
      .click()

    const filePath = '../../../' + Cypress.env('filePath') + '/aurige.nonReussite.json'
    const fileName = 'aurige.nonReussite.json'
    cy.get('.input-file-container [type=file]')
      .attachFile({
        filePath,
        fileName,
        mimeType: 'application/json',
      })

    cy.get('.v-snack--active')
      .should('contain', fileName + ' prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click()
    cy.get('.v-snack--active')
      .should('contain', 'Le fichier ' + fileName + ' a été synchronisé.')

    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + nowIn1WeekAnd1DaysBefore03.toFormat('yyyy-MM-dd'))
    nbExams++
    nbFailed++

    cy.get('.t-number-inscrit-' + nbInscrits)
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + nbPlaces)
      .should('have.length', 1)
    cy.get('.v-snack--active button').should('be.visible').click({ force: true })
    cy.adminDisconnection()
  })

  it('Checks candidate no receivable', () => {
    cy.adminLogin()
    cy.addCandidatToPlace(nowIn1WeekAnd1DaysBefore01, 'CANDIDAT_STATS_KPI')
    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + nowIn1WeekAnd1DaysBefore03.toFormat('yyyy-MM-dd'))

    cy.get('.t-number-inscrit-' + (nbInscrits - nbBooked))
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + (nbPlaces - nbBooked))
      .should('have.length', 1)

    cy.get('.v-snack--active button').should('be.visible').click({ force: true })
    cy.writeFile(Cypress.env('filePath') + '/aurige.nonRecevable.json',
      [
        {
          codeNeph: Cypress.env('candidatStatsKpiNeph'),
          nomNaissance: Cypress.env('candidatStatsKpi'),
          email: Cypress.env('emailCandidatStatsKpi'),
          dateReussiteETG: new Date(),
          nbEchecsPratiques: '0',
          dateDernierNonReussite: nowIn1WeekAnd1DaysBefore01.toFormat('yyyy-MM-dd'),
          objetDernierNonReussite: 'Non recevable',
          reussitePratique: '',
          candidatExistant: 'OK',
        },
      ])

    cy.contains('import_export')
      .click()

    const filePath = '../../../' + Cypress.env('filePath') + '/aurige.nonRecevable.json'
    const fileName = 'aurige.nonRecevable.json'
    cy.get('.input-file-container [type=file]')
      .attachFile({
        filePath,
        fileName,
        mimeType: 'application/json',
      })

    cy.get('.v-snack--active')
      .should('contain', fileName + ' prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click()
    cy.get('.v-snack--active')
      .should('contain', 'Le fichier ' + fileName + ' a été synchronisé.')
    nbExams++
    nbNotExamined++

    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + nowIn1WeekAnd1DaysBefore03.toFormat('yyyy-MM-dd'))

    cy.get('.t-number-inscrit-' + nbInscrits)
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + nbPlaces)
      .should('have.length', 1)
    cy.get('.v-snack--active button').should('be.visible').click({ force: true })
    cy.adminDisconnection()
  })

  it('Checks candidate no examinable', () => {
    cy.adminLogin()
    cy.addCandidatToPlace(nowIn1WeekAnd1DaysBefore02, 'CANDIDAT_STATS_KPI')
    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + nowIn1WeekAnd1DaysBefore03.toFormat('yyyy-MM-dd'))

    cy.get('.t-number-inscrit-' + (nbInscrits - nbBooked))
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + (nbPlaces - nbBooked))
      .should('have.length', 1)

    cy.get('.v-snack--active button').should('be.visible').click({ force: true })
    cy.writeFile(Cypress.env('filePath') + '/aurige.nonExaminable.json',
      [
        {
          codeNeph: Cypress.env('candidatStatsKpiNeph'),
          nomNaissance: Cypress.env('candidatStatsKpi'),
          email: Cypress.env('emailCandidatStatsKpi'),
          dateReussiteETG: new Date(),
          nbEchecsPratiques: '0',
          dateDernierNonReussite: nowIn1WeekAnd1DaysBefore02.toFormat('yyyy-MM-dd'),
          objetDernierNonReussite: 'Non examinable',
          reussitePratique: '',
          candidatExistant: 'OK',
        },
      ])

    cy.contains('import_export')
      .click()

    const filePath = '../../../' + Cypress.env('filePath') + '/aurige.nonExaminable.json'
    const fileName = 'aurige.nonExaminable.json'
    cy.get('.input-file-container [type=file]')
      .attachFile({
        filePath,
        fileName,
        mimeType: 'application/json',
      })

    cy.get('.v-snack--active')
      .should('contain', fileName + ' prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click()
    cy.get('.v-snack--active')
      .should('contain', 'Le fichier ' + fileName + ' a été synchronisé.')
    nbExams++
    nbNotExamined++
    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + nowIn1WeekAnd1DaysBefore03.toFormat('yyyy-MM-dd'))

    cy.get('.t-number-inscrit-' + nbInscrits)
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + nbPlaces)
      .should('have.length', 1)
    cy.get('.t-non-examines')
      .should('contain', Number(nbNotExamined / nbExams * 100).toFixed(2))
    cy.get('.v-snack--active button').should('be.visible').click({ force: true })
    cy.adminDisconnection()
  })

  it('Checks candidate absent', () => {
    cy.adminLogin()
    cy.addCandidatToPlace(nowIn1WeekAnd1DaysBefore03, 'CANDIDAT_STATS_KPI')
    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + nowIn1WeekAnd1DaysBefore03.toFormat('yyyy-MM-dd'))

    cy.get('.t-number-inscrit-' + (nbInscrits - nbBooked))
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + (nbPlaces - nbBooked))
      .should('have.length', 1)

    cy.get('.v-snack--active button').should('be.visible').click({ force: true })
    cy.writeFile(Cypress.env('filePath') + '/aurige.absent.json',
      [
        {
          codeNeph: Cypress.env('candidatStatsKpiNeph'),
          nomNaissance: Cypress.env('candidatStatsKpi'),
          email: Cypress.env('emailCandidatStatsKpi'),
          dateReussiteETG: new Date(),
          nbEchecsPratiques: '0',
          dateDernierNonReussite: nowIn1WeekAnd1DaysBefore03.toFormat('yyyy-MM-dd'),
          objetDernierNonReussite: 'Absent',
          reussitePratique: '',
          candidatExistant: 'OK',
        },
      ])

    cy.contains('import_export')
      .click()

    const filePath = '../../../' + Cypress.env('filePath') + '/aurige.absent.json'
    const fileName = 'aurige.absent.json'
    cy.get('.input-file-container [type=file]')
      .attachFile({
        filePath,
        fileName,
        mimeType: 'application/json',
      })
    cy.get('.v-snack--active')
      .should('contain', fileName + ' prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click()
    cy.get('.v-snack--active')
      .should('contain', 'Le fichier ' + fileName + ' a été synchronisé.')
    nbExams++

    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + nowIn1WeekAnd1DaysBefore03.toFormat('yyyy-MM-dd'))

    cy.get('.t-number-inscrit-' + nbInscrits)
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + nbPlaces)
      .should('have.length', 1)
    cy.get('.t-absenteisme')
      .should('contain', Number(1 / nbExams * 100).toFixed(2))
    cy.get('.v-snack--active button').should('be.visible').click({ force: true })
    cy.adminDisconnection()
  })

  it('Checks candidate success', () => {
    cy.adminLogin()
    cy.addCandidatToPlace(undefined, 'CANDIDAT_STATS_KPI')
    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + nowIn1WeekAnd1DaysBefore03.toFormat('yyyy-MM-dd'))

    cy.get('.t-number-inscrit-' + (nbInscrits - nbBooked))
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + (nbPlaces - nbBooked))
      .should('have.length', 1)

    cy.get('.v-snack--active button').should('be.visible').click({ force: true })
    cy.writeFile(Cypress.env('filePath') + '/aurige.reussite.json',
      [
        {
          codeNeph: Cypress.env('candidatStatsKpiNeph'),
          nomNaissance: Cypress.env('candidatStatsKpi'),
          email: Cypress.env('emailCandidatStatsKpi'),
          dateReussiteETG: new Date(),
          nbEchecsPratiques: '0',
          dateDernierNonReussite: '',
          objetDernierNonReussite: '',
          reussitePratique: Cypress.env('placeDate'),
          candidatExistant: 'OK',
        },
      ])

    cy.contains('import_export')
      .click()

    const filePath = '../../../' + Cypress.env('filePath') + '/aurige.reussite.json'
    const fileName = 'aurige.reussite.json'
    cy.get('.input-file-container [type=file]')
      .attachFile({
        filePath,
        fileName,
        mimeType: 'application/json',
      })

    cy.get('.v-snack--active')
      .should('contain', fileName + ' prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click()
    cy.get('.v-snack--active')
      .should('contain', 'Le fichier ' + fileName + ' a été synchronisé.')
    nbExams++
    const nbSuccess = 1
    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + nowIn1WeekAnd1DaysBefore03.toFormat('yyyy-MM-dd'))

    cy.get('.t-number-inscrit-0')
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + nbPlaces)
      .should('have.length', 1)
    cy.get('.t-reussite')
      .should('contain', Number(nbSuccess / (nbSuccess + nbFailed) * 100).toFixed(2))
    cy.get('.t-total-places-' + nbExams)
      .should('have.length', 1)
    cy.get('.v-snack--active button').should('be.visible').click({ force: true })
    cy.adminDisconnection()
  })
})
