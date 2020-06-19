const { now } = require('../support/dateUtils')
let dateAt3Months
let dateAt2Months
let dateAt1Months
let dateAt2Weeks
describe('Display new place after 12h', () => {
  const NbCreneauxByDay = 13 * 2
  let magicLink
  before(() => {
    cy.daleteAllPlaces()

    cy.deleteAllMails()
    cy.adminLogin()

    dateAt2Months = now.plus({ months: 2 }).startOf('week')
    dateAt1Months = now.plus({ months: 1 }).startOf('week')
    dateAt2Weeks = now.plus({ weeks: 2 }).startOf('week')
    dateAt3Months = now.plus({ months: 3 }).startOf('week')
    cy.addPlanning([dateAt2Weeks, dateAt1Months, dateAt3Months, dateAt2Months])
    cy.adminDisconnection()
    cy.updatePlaces({}, { createdAt: now.set({ hour: 9 }).minus({ days: 1 }).toUTC() })
    cy.updatePlaces({ date: { $gte: dateAt1Months.toUTC() } }, { createdAt: now.set({ hour: 12 }).minus({ days: 1 }).toUTC() })
    cy.updatePlaces({ date: { $gte: dateAt2Months.toUTC() } }, { createdAt: now.set({ hour: 9 }).toUTC() })
    cy.updatePlaces({ date: { $gte: dateAt3Months.toUTC() } }, { createdAt: now.set({ hour: 12 }).toUTC() })

    cy.candidatConnection(Cypress.env('emailCandidatFront'))
    cy.getLastMail().its('Content.Body').then((mailBody) => {
      const codedLink = mailBody.split('href=3D"')[1].split('">')[0]
      const withoutEq = codedLink.replace(/=\r\n/g, '')
      magicLink = withoutEq.replace(/=3D/g, '=')
    })

    cy.updateCandidat({ email: Cypress.env('emailCandidatFront') }, { canBookFrom: '' })
  })

  const NbCreneaux = now.hour < 12 ? NbCreneauxByDay : NbCreneauxByDay * 3
  it(`Should ${NbCreneaux} places for 93`, () => {
    cy.visit(magicLink)

    cy.get('h2').should('contain', 'Choix du département')
    cy.get('body').should('contain', Cypress.env('geoDepartement'))
    cy.contains(Cypress.env('geoDepartement')).parent('div').within(($div) => {
      cy.root().should('contain', `${NbCreneaux} places`)
    }).click()

    cy.get('h2').should('contain', 'Choix du centre')
    cy.get('body').should('contain', Cypress.env('centre'))
    cy.contains(Cypress.env('centre')).click()

    const dates = [dateAt2Weeks]
    const datesNoDisplay = [dateAt3Months]
    if (now.hour < 12) {
      datesNoDisplay.concat([dateAt2Months, dateAt1Months])
    } else {
      dates.concat([dateAt2Months, dateAt1Months])
    }

    dates.forEach((datePlace) => {
      cy.get(`[href="#tab-${datePlace.monthLong}"]`).click()
      const daySelected = datePlace.toFormat('dd')
      cy.get('body').should('contain', ' ' + daySelected + ' ')
    })
    datesNoDisplay.forEach((datePlace) => {
      cy.get(`[href="#tab-${datePlace.monthLong}"]`).click()
      const daySelected = datePlace.toFormat('dd')
      cy.get('body').should('not.contain', ' ' + daySelected + ' ')
    })
  })
})
