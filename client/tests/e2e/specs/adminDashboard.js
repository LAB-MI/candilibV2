/* Tests :
- Candidate search and display of the name
- Inspector search and display of the name
- Checks the display of the centers for the 75 and 93
- Checks the correct display of the places in the center
- Checks that the link directs to the right date and center
*/

describe('Dashboard tests', () => {
  before(() => {
    // Delete all mails before start
    cy.deleteAllMails()
    cy.adminLogin()
    cy.addPlanning()
    cy.adminDisconnection()
  })

  it('Searches for inspecteur', () => {
    cy.adminLogin()
    cy.get('.t-search-inspecteur [type=text]')
      .type(Cypress.env('inspecteur'))
    cy.contains(Cypress.env('inspecteur'))
      .click()
    cy.get('h3')
      .should('contain', 'nformations')
    cy.get('.t-result-inspecteur')
      .contains('Nom')
      .parent()
      .should('contain', Cypress.env('inspecteur'))
  })

  it('Checks the number of centers in the 75 and 93', () => {
    cy.adminLogin()
    // Checks the number of centers in the 75 and 93
    cy.get('.layout.row.wrap').children()
      .should(children => {
        // Can be either 3 or 6 depending on when this test is done, and both are valid
        expect([3, 6].includes(children.length)).to.be.true // eslint-disable-line no-unused-expressions
      })
    cy.get('.hexagon-wrapper').contains('93')
      .click()
    cy.get('.layout.row.wrap').children()
      .should('have.length', 4)
    cy.get('.hexagon-wrapper').contains('75')
      .click()
  })

  it('Goes to the planning by clicking on a date', () => {
    cy.adminLogin()
    cy.get('h2.title')
      .should('contain', Cypress.env('centre'))
      .contains(Cypress.env('centre'))
      .parents('.monitor-wrapper').within(($centre) => {
        cy.contains(Cypress.env('dateDashboard'))
          .parents('tr').within(($row) => {
            cy.get('button').first()
              .within(($button) => {
                cy.get('.v-btn__content > :nth-child(3) > strong')
                  .invoke('text').as('placesDispo')
                cy.root().click()
              })
          })
      })
    cy.url()
      .should('contain', Cypress.env('placeDate'))
    cy.get('.t-date-picker [type=text]').invoke('val')
      .should('contain', Cypress.env('dateLong'))
    cy.get('.v-tab--active')
      .should('contain', Cypress.env('centre'))
    // Checks the number of places available
    cy.get('.v-window-item').not('[style="display: none;"]')
      .should('have.length', 1)
      .within(($window) => {
        cy.get('@placesDispo').then((placesDispo) => {
          cy.get('.place-button .v-icon:contains("check_circle")')
            .should('have.length', placesDispo)
        })
      })
  })
})
