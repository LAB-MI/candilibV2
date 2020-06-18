/* Tests :
- Admin login
- Restricted admin login
- Admin login with incorrect password/email combination
- Admin login with invalid email
- Admin deconnection
*/

describe('Admin login', () => {
  it('Tests the admin login and disconnection', () => {
    cy.adminLogin()
    cy.get('h2')
      .should('contain', 'Tableau de bord')
    cy.get('h3')
      .should('contain', Cypress.env('adminLogin').split('@')[0])
    // Disconnects from the app
    cy.adminDisconnection()
    cy.url()
      .should('eq', Cypress.env('frontAdmin') + 'admin-login')
  })

  it('Logins with a restricted admin account', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin-login')
    cy.get('.t-login-email [type=text]')
      .type(Cypress.env('admin93Login'))
    cy.get('[type=password]')
      .type(Cypress.env('admin93Pass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack--active')
      .should('contain', 'Vous êtes identifié')
    cy.get('.hexagon-wrapper')
      .should('not.contain', '75')
      .and('contain', '93')
    cy.get('h3')
      .should('contain', 'admin93')
    cy.get('.title')
      .should('contain', 'BOBIGNY')
    cy.get('.v-toolbar')
      .should('not.contain', 'import_export')
    cy.contains('calendar_today').click()
    cy.get('.v-tab')
      .should('contain', 'BOBIGNY')
  })

  it('Tries the admin login with an invalid password', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin-login')
    cy.get('.t-login-email [type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass') + 'bad')
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack--active')
      .should('contain', 'Identifiants invalides')
  })

  it('Tries the admin login with an invalid email', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin-login')
    cy.get('.t-login-email [type=text]')
      .type('admin@example')
    cy.get('[type=password]')
      .type('password')
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack--active')
      .should('contain', 'Veuillez remplir le formulaire')
  })
})
