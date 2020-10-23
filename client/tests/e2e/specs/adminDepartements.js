/*
Add departement in list
Add departement already exist
Update departement email
Delete departement unuse by center
Delete departement use by center
*/

describe('Create, see, update and delete departement', () => {
  const departement77Email = 'departement77@example.com'
  const departement077Email = 'departement077@example.com'
  const departement77Id = '77'
  const departement75Id = '75'
  const departement0077Email = 'departement0077@example.com'

  before(() => {
    cy.deleteAllMails()
  })

  beforeEach(() => {
    cy.adminLogin()
  })

  afterEach(() => {
    cy.adminDisconnection()
  })

  it('Should create a new departement', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin/departements')
    cy.get('.t-input-email [type=text]')
      .type(departement77Email)
    cy.get('.t-input-departementId [type=text]')
      .type(departement77Id)
    cy.get('.t-create-btn')
      .click()

    cy.get('.v-snack--active')
      .should('contain', `Le département ${departement77Id} a bien été créé avec l'adresse courriel ${departement77Email}`)
  })

  it('Should not create a departement with existing id', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin/departements')
    cy.get('.t-input-email [type=text]')
      .type(departement077Email)
    cy.get('.t-input-departementId [type=text]')
      .type(departement77Id)
    cy.get('.t-create-btn')
      .click()

    cy.get('.v-snack--active')
      .should('contain', 'Ce département existe déjà')
  })

  it('Should update departement', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin/departements')
    cy.get(`.t-btn-update-${departement77Id}`)
      .click()
    cy.get('.t-input-newEmail [type=text]')
      .type(departement0077Email)
    cy.get('.t-btn-update-confirm')
      .click()
    cy.get('.v-snack--active')
      .should('contain', `Le département ${departement77Id} a bien été mis à jour`)
  })

  it('Should delete departement unused by center', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin/departements')
    cy.get(`.t-btn-delete-${departement77Id}`)
      .click()
    cy.get('.t-input-confirm-id  [type=text]')
      .type(departement77Id)
    cy.get('.t-btn-delete-confirm')
      .click()
    cy.get('.v-snack--active')
      .should('contain', `Le département ${departement77Id} a bien été supprimé`)
  })

  it('Should not delete departement used by center', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin/departements')
    cy.get(`.t-btn-delete-${departement75Id}`)
      .click()
    cy.get('.t-input-confirm-id  [type=text]')
      .type(departement75Id)
    cy.get('.t-btn-delete-confirm')
      .click()
    cy.get('.v-snack--active')
      .should('contain', `Le département ${departement75Id} n'a pas été supprimé, car des centres y sont liés`)
    cy.get('.t-btn-cancel-delete')
      .click()
  })
})
