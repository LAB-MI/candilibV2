/* Tests :
- description du test
*/

describe('Tech Admin Dashboard tests', () => {
  before(() => {
    // Delete all mails before start
    cy.deleteAllMails()
    cy.adminTechLogin()
    cy.adminDisconnection()
  })

  it('Start automate and verify started status', () => {
    cy.adminTechLogin()
    cy.get('.t-btn-status-automate').should('contain', 'Stopped')
    cy.get('.t-btn-start-automate').click()
    cy.get('.t-btn-status-automate').should('contain', 'Started')
    cy.get('.t-btn-stop-automate').click()
    cy.get('.t-btn-status-automate').should('contain', 'Stopped')
  })
})
