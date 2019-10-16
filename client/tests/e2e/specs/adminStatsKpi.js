/* Tests :

*/

describe('Stats Kpi tests', () => {
  before(() => {
    cy.mhDeleteAll()
    // login admin
    cy.adminLogin()
    // archive candidat already in db
    cy.archiveCandidate()
    // ajouter des places
    cy.addPlanning()
    // ajouter email candidat a la white list
    cy.addToWhitelist()
    // deconnecter l'admin
    cy.adminDisconnection()
    // pre-inscription candidat
    cy.candidatePreSignUp()
    cy.adminLogin()
    // validation candidat pas aurige
    cy.candidateValidation()
    // deconnecter l'admin
    cy.adminDisconnection()
  })
  it('Checks if candidate subscribed', () => {
    cy.adminLogin()
    cy.contains('bar_chart')
      .click()

    cy.get('.t-number-inscrit-1')
      .should('have.length', 1)

    cy.get('.t-number-reserved-places-0')
      .should('have.length', 1)

    cy.get('.t-number-future-places-36')
      .should('have.length', 1)
    cy.adminDisconnection()
  })
  it('Checks candidate booked place', () => {
    cy.adminLogin()
    cy.addCandidatToPlace()
    // verifier que le candidat a bien une place reserver dans les stats
    cy.adminDisconnection()
  })
})
