// https://docs.cypress.io/api/introduction/api.html

describe('Candidat Login', () => {
  it('Visits the candidat subscribe form', () => {
    cy.visit('http://localhost:8080/candilib/qu-est-ce-que-candilib')
    cy.get('.t-already-signed-up-button-top')
      .should('contain', 'Déjà Inscrit ?')
      .click()
    cy.get('')
  })
})
