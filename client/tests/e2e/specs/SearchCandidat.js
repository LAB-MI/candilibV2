/* Tests :
- Candidate search and display of the name
- Inspector search and display of the name
- Checks the display of the centers for the 75 and 93
- Checks the correct display of the places in the center
- Checks that the link directs to the right date and center
*/

describe('Search Candidat', () => {
  before(() => {
    // Delete all mails before start
    cy.deleteAllMails()
    cy.adminLogin()
    cy.addToWhitelist()
    cy.adminDisconnection()
    cy.candidatePreSignUp()
  })

  it('Searches for candidat', () => {
    cy.adminLogin()
    cy.visit(Cypress.env('frontAdmin') + 'admin/admin-candidat')
    cy.get('.t-search-candidat [type=text]')
      .type(Cypress.env('candidat'))
    cy.contains(Cypress.env('candidat'))
      .click()
    cy.get('h3')
      .should('contain', 'nformations')
    cy.get('h4')
      .should('contain', Cypress.env('candidat'))
  })
})
