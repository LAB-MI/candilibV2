/* Tests :
- Candidate search and display of the name
*/

describe('Search Candidate', () => {
  before(() => {
    // Delete all mails before start
    cy.deleteAllMails()
    cy.adminLogin()
    cy.archiveCandidate()
    cy.addPlanning()
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
    cy.get('.t-result-candidat')
      .contains('Email')
      .parent()
      .should('contain', Cypress.env('emailCandidat'))
    cy.adminDisconnection()
  })
})
