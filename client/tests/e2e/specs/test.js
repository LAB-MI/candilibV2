// https://docs.cypress.io/api/introduction/api.html

describe('Candidat Login', () => {
  it('Visits the candidat subscribe form', () => {
    cy.visit('http://localhost:8080/candilib/qu-est-ce-que-candilib')
    cy.get('.t-already-signed-up-button-bottom')
      .should('contain', 'Déjà Inscrit ?')
      .click()
    cy.get('.t-magic-link-input-bottom [type=text]')
      .type('jean@dupont.fr')
    cy.get('.t-magic-link-button-bottom')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Utilisateur non reconnu')
  })
})
