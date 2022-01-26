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

  const ipcsr4 = {
    email: 'inspecteur4@example.com',
    firstname: 'Quatriéme',
    name: 'nom',
    matricule: '44444444',
    departement: '93',
    secondEmail: 'inspecteur4@example.fr',
  }

  const ipcsr5 = {
    email: 'inspecteur5@example.com',
    firstname: 'Cinquiéme',
    name: 'nom',
    matricule: '55555555',
    departement: '93',
    secondEmail: 'inspecteur5@example.fr',
  }
  const ipcsr6 = {
    email: 'inspecteur6@example.com',
    firstname: 'Sixiéme',
    name: 'nom',
    matricule: '66666666',
    departement: '93',
    secondEmail: 'inspecteur6@example.fr',
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

  const createIpcsr = (ipcsr, { departement, message, email } = {}) => {
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email  input').type(email || ipcsr.email, { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-firstname  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-firstname  input').type(ipcsr.firstname, { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-name  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-name  input').type(ipcsr.name, { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-matricule  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-matricule  input').type(ipcsr.matricule, { force: true })
    cy.get('.t-create-ipcsr-form  .t-select-ipcsr-departement .v-input__slot').click()
    cy.get('.v-list-item').contains(departement || ipcsr.departement).click()

    if (ipcsr.secondEmail) {
      cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email2  input').type('{selectall}{backspace}', { force: true })
      cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email2  input').type(ipcsr.secondEmail, { force: true })
    }

    cy.get('.t-create-ipcsr-btn').click()

    cy.checkAndCloseSnackBar(message || 'L\'IPCSR a bien été créé')
  }

  it('Should create a new IPCSR', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin/agents')
    createIpcsr(ipcsr1)

    cy.get('.t-list-ipcsr')
      .find('th span')
      .first()
      .click({ force: true })
      .click({ force: true })

    cy.get('.t-list-ipcsr').should('contain', ipcsr1.email)
  })

  it('Should create a new IPCSR wth second email', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin/agents')
    createIpcsr(ipcsr4)

    cy.get('.t-list-ipcsr')
      .find('th span')
      .first()
      .click({ force: true })
      .click({ force: true })

    cy.get('.t-list-ipcsr').should('contain', ipcsr4.email)
  })

  it('Should not create a new IPCSR with existing email or existing matricule', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin/agents')
    createIpcsr(ipcsr2, { departement: ipcsr1.departement })
    createIpcsr(ipcsr2, { message: `Cette adresse courriel existe déjà : ${ipcsr2.email}` })

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

  it('Should not create a new IPCSR with existing second email', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin/agents')
    createIpcsr(ipcsr5)
    const message = `Cette adresse courriel existe déjà : ${ipcsr5.secondEmail}`
    createIpcsr(ipcsr6, { email: ipcsr5.secondEmail, message })

    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email  input').type(ipcsr6.email, { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email2  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email2  input').type(ipcsr5.email, { force: true })
    cy.get('.t-create-ipcsr-btn').click()
    cy.checkAndCloseSnackBar(`Cette adresse courriel existe déjà : ${ipcsr5.email}`)

    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email2  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email2  input').type(ipcsr5.secondEmail, { force: true })
    cy.get('.t-create-ipcsr-btn').click()
    cy.checkAndCloseSnackBar(message)

    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email2  input').type('{selectall}{backspace}', { force: true })
    cy.get('.t-create-ipcsr-form  .t-input-ipcsr-email2  input').type(ipcsr6.secondEmail, { force: true })
    cy.get('.t-create-ipcsr-btn').click()
    cy.checkAndCloseSnackBar('L\'IPCSR a bien été créé')

    cy.get('.t-list-ipcsr')
      .find('th span')
      .first()
      .click({ force: true })
      .click({ force: true })

    cy.get('.t-list-ipcsr').should('contain', ipcsr6.email)
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
