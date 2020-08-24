const { now } = require('../support/dateUtils')

describe('Display new place after delay', () => {
  const NbCreneauxByDay = 16 * 2
  let magicLink
  before(() => {
    cy.candidatConnection(Cypress.env('emailCandidatFront'))
    cy.getLastMail().its('Content.Body').then((mailBody) => {
      const codedLink = mailBody.split('href=3D"')[1].split('">')[0]
      const withoutEq = codedLink.replace(/=\r\n/g, '')
      magicLink = withoutEq.replace(/=3D/g, '=')
    })
  })

  it(`Should ${NbCreneauxByDay} places for 93`, () => {
    cy.deleteAllPlaces()
    cy.deleteAllMails()
    cy.adminLogin()
    const dateAt2Months = now.plus({ months: 2 }).startOf('week')
    cy.addPlanning([dateAt2Months])
    cy.adminDisconnection()
    cy.updatePlaces({ date: { $gte: dateAt2Months.toUTC() } }, { createdAt: now.minus({ hours: 2 }).toUTC() })

    cy.updateCandidat({ email: Cypress.env('emailCandidatFront') }, { canBookFrom: '' })
    cy.visit(magicLink)
    cy.wait(100)

    cy.get('h2').should('contain', 'Choix du département')
    cy.get('body').should('contain', Cypress.env('geoDepartement'))

    cy.get('.v-card > .v-list')
      .contains(Cypress.env('geoDepartement'))
      .parent('div').within(($div) => {
        cy.root().should('contain', `${NbCreneauxByDay} places`)
      }).click()
    cy.wait(100)

    cy.get('h2').should('contain', 'Choix du centre')
    cy.get('body').should('contain', Cypress.env('centre'))
    cy.contains(Cypress.env('centre')).click()
    cy.wait(100)

    cy.get(`[href="#tab-${dateAt2Months.monthLong}"]`).click()
    const daySelected = dateAt2Months.toFormat('dd')
    cy.get('body').should('contain', ' ' + daySelected + ' ')
  })

  it('Should 0 places for 93', () => {
    cy.deleteAllPlaces()
    cy.deleteAllMails()
    cy.adminLogin()
    const dateAt2Months = now.plus({ months: 2 }).startOf('week')
    cy.addPlanning([dateAt2Months])
    cy.adminDisconnection()
    cy.updatePlaces({ date: { $gte: dateAt2Months.toUTC() } }, { createdAt: now.minus({ hours: 1 }).toUTC() })

    cy.visit(magicLink)
    cy.wait(100)

    cy.get('h2').should('contain', 'Choix du département')
    cy.get('body').should('contain', Cypress.env('geoDepartement'))

    cy.get('.v-card > .v-list')
      .contains(Cypress.env('geoDepartement'))
      .parent('div').within(($div) => {
        cy.root().should('contain', '0 place')
      })
  })
})
