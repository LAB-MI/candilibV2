/*
Add user in users list
Add user with an exiting email
Cancel Archive user
Archive user
*/

describe('users', () => {
  before(() => {
    cy.deleteAllMails()
    cy.adminLogin()
    cy.adminDisconnection()
  })

  it('create users tests', () => {
    cy.adminLogin()
    cy.visit(Cypress.env('frontAdmin') + 'admin/users')
    cy.get('.t-input-email [type=text]')
      .type(Cypress.env('createUser'))
    cy.get('.t-select-status')
      .type(Cypress.env('repartiteur'))
    cy.get('.t-select-departements')
      .type(Cypress.env('departements'))
    cy.get('.t-create-btn')
      .click()

    cy.get('.v-snack')
      .should('contain', `L'utilisateur a bien été créé`)
  })

  it('create users tests with email exist', () => {
    cy.adminLogin()
    cy.visit(Cypress.env('frontAdmin') + 'admin/users')
    cy.get('.t-input-email [type=text]')
      .type(Cypress.env('createUser'))
    cy.get('.t-select-status')
      .type(Cypress.env('repartiteur'))
    cy.get('.t-select-departements')
      .type(Cypress.env('departements'))
    cy.get('.t-create-btn')
      .click()

    cy.get('.v-snack')
      .should('contain', `Impossible de créer l'utilisateur : l'email existe déjà`)
  })

  it('Cancel Archive users', () => {
    cy.adminLogin()
    cy.visit(Cypress.env('frontAdmin') + 'admin/users')
    cy.get('.t-list-email')
      .contains(Cypress.env('createUser'))
      .parents('.t-list')
      .find('.t-btn-delete')
      .click()
    cy.get('.t-btn-cancel-delete')
      .click()
  })

  it('Archive users', () => {
    cy.adminLogin()
    cy.visit(Cypress.env('frontAdmin') + 'admin/users')
    cy.get('.t-list-email')
      .contains(Cypress.env('createUser'))
      .parents('.t-list')
      .find('.t-btn-delete')
      .click()
    cy.get('.t-btn-delete-confirm')
      .click()

    cy.get('.v-snack')
      .should('contain', `L'utilisateur a bien été archivé`)
  })
})
