/*
Add IPCSR in IPCSRs list
Add IPCSR with an exiting email
Cancel Archive IPCSR
Archive IPCSR
*/

describe('Create and see the list of IPCSR', () => {
  const ipcsr1 = {
    email: 'inspecteur1@example.com',
    firstname: 'Premier',
    name: 'nom',
    matricule: '11111111',
    departement: '93',
  }

  const ipcsr2 = {
    email: 'inspecteur2@example.com',
    newEmail: 'inspecteur2b@example.com',
    firstname: 'Deuxième',
    name: 'nom',
    matricule: '22222222',
    departement: '93',
  }

  const ipcsr3 = {
    email: 'inspecteur3@example.com',
    firstname: 'Troisième',
    name: 'nom',
    matricule: '33333333',
    departement: '93',
    newDepartement: '75',
  }

  before(() => {
    cy.deleteAllMails()
  })

  beforeEach(() => {
    cy.adminLogin()
  })

  afterEach(() => {
    cy.adminDisconnection()
  })

  it('Should create a new IPCSR', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin/agents')
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email  input').type(ipcsr1.email, { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-firstname  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-firstname  input').type(ipcsr1.firstname, { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-name  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-name  input').type(ipcsr1.name, { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-matricule  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-matricule  input').type(ipcsr1.matricule, { force: true })
    cy.get('.t-create-ipcsr-form  .t-select-ipcsr-departement .v-input__slot').click()
    cy.get('.v-list-item').contains(ipcsr1.departement).click()

    cy.get('.t-create-ipcsr-form  .t-select-ipcsr-departement').click()
    cy.get('.v-list-item').first().click()
    cy.get('.t-create-ipcsr-btn').click()

    cy.get('.v-snack--active').should('contain', 'L\'IPCSR a bien été créé')

    cy.get('.t-list-ipcsr')
      .find('th span')
      .first()
      .click({ force: true })
      .click({ force: true })

    cy.get('.t-list-ipcsr').should('contain', ipcsr1.email)
  })

  it('Should not create a new IPCSR with existing email or existing matricule', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin/agents')
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email  input').type(ipcsr2.email, { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-firstname  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-firstname  input').type(ipcsr2.firstname, { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-name  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-name  input').type(ipcsr2.name, { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-matricule  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-matricule  input').type(ipcsr2.matricule, { force: true })

    cy.get('.t-create-ipcsr-form  .t-select-ipcsr-departement .v-input__slot').click()
    cy.get('.v-list-item').contains(ipcsr1.departement).click()
    cy.get('.t-create-ipcsr-btn').click()

    cy.get('.v-snack--active').should('contain', 'L\'IPCSR a bien été créé')

    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email  input').type(ipcsr2.email, { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-firstname  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-firstname  input').type(ipcsr2.firstname, { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-name  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-name  input').type(ipcsr2.name, { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-matricule  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-matricule  input').type(ipcsr2.matricule, { force: true })

    cy.get('.t-create-ipcsr-form  .t-select-ipcsr-departement .v-input__slot').click()
    cy.get('.v-list-item__title').contains(ipcsr2.departement).click()
    cy.get('.t-create-ipcsr-btn').click()

    cy.get('.v-snack--active').should('contain', `Cette adresse courriel existe déjà : ${ipcsr2.email}`)

    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email  input').type(ipcsr2.newEmail, { force: true })
    cy.get('.t-create-ipcsr-btn').click()

    cy.get('.v-snack--active').should('contain', `Ce matricule existe déjà : ${ipcsr2.matricule}`)

    cy.get('.t-list-ipcsr')
      .find('th span')
      .first()
      .click({ force: true })
      .click({ force: true })

    cy.get('.t-list-ipcsr').should('contain', ipcsr2.email)
  })

  it('Should update an IPCSR', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin/agents')
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email  input').type(ipcsr3.email, { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-firstname  input').type(ipcsr3.firstname, { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-name  input').type(ipcsr3.name, { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-matricule  input').type(ipcsr3.matricule, { force: true })
    cy.get('.t-create-ipcsr-form  .t-select-ipcsr-departement .v-input__slot').click()
    cy.get('.menuable__content__active .v-list-item__title').contains(ipcsr3.departement).should('be.visible').click()
    cy.get('.t-create-ipcsr-btn').click()

    cy.get('.v-snack--active').should('contain', 'L\'IPCSR a bien été créé')

    cy.get('.t-list-ipcsr')
      .find('th span')
      .first()
      .click({ force: true })
      .click({ force: true })

    cy.get('.t-list-ipcsr').should('contain', ipcsr3.email)

    cy.contains(ipcsr3.email).parents('tr').find('.t-btn-update').click()

    cy.get('.v-dialog--active')
      .find('.t-select-update-ipcsr-departements .v-input__slot')
      .click()
    cy.get('.menuable__content__active .v-list-item__title')
      .contains(ipcsr3.newDepartement).should('be.visible')
      .click()
    cy.get('.v-dialog--active').find('.t-btn-update-ipcsr-confirm')
      .click({ force: true })

    cy.contains(ipcsr3.email)
      .parents('tr')
      .should('contain', ipcsr3.newDepartement)
  })
})
