
describe('Manage centers', () => {
  const centre = {
    nom: 'BOBO',
    label: 'Infos complémentaires bloblo',
    adresse: 'Adresse précise du centre avec un code postale en 2A000',
    lon: 2,
    lat: 25,
    departement: '75',
  }

  const centre2 = {
    nom: 'BABA',
    label: 'Infos complémentaires blabla',
    adresse: 'Adresse précise du centre',
    lon: 2,
    lat: 25,
    departement: '75',
    geoDepartement: '2A',
  }

  const centre3 = {
    nom: 'BIBI',
    label: 'Infos complémentaires blibli',
    adresse: 'Adresse précise du centre avec un code postale 94000',
    lon: 2,
    lat: 25,
    departement: '75',
  }

  before(() => {
    cy.deleteCentres([centre, centre2, centre3, { nom: centre2.nom + ' updated' }])
  })
  beforeEach(() => {
    cy.adminLogin()
  })

  afterEach(() => {
    cy.adminDisconnection()
  })

  it('Ajouter un centre', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin/centres')
    cy.get('.t-create-centre-form')
      .find('[name=nom-centre]')
      .type(centre.nom)
    cy.get('.t-create-centre-form')
      .find('[name=label-centre]')
      .type(centre.label)
    cy.get('.t-create-centre-form')
      .find('[name=adresse-centre]')
      .type(centre.adresse)
    cy.get('.t-create-centre-form')
      .find('[name=lon-centre]')
      .type(centre.lon)
    cy.get('.t-create-centre-form')
      .find('[name=lat-centre]')
      .type(centre.lat)

    cy.get(
      '.t-create-centre-form  .t-create-center-select-departement  .v-input__slot',
    ).click()
    cy.get('.v-list-item')
      .contains(centre.departement)
      .click()

    cy.get('.t-create-centre-submit')
      .click()

    cy.get('.t-list-centres')
      .find('th span')
      .first()
      .click({ force: true })

    cy.get('.t-list-centres')
      .should('contain', centre.departement)

    cy.get('.t-list-centres')
      .should('contain', centre.nom)
    cy.get('.t-list-centres')
      .should('contain', centre.adresse)

    cy.get('.t-list-centres')
      .should('contain', '2A')

    cy.get('.v-snack__content')
      .should('contain', 'a bien été créé')
  })

  it('Modifier un centre', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin/centres')
    cy.get('.t-create-centre-form')
      .find('[name=nom-centre]')
      .type(centre2.nom)
    cy.get('.t-create-centre-form')
      .find('[name=label-centre]')
      .type(centre2.label)
    cy.get('.t-create-centre-form')
      .find('[name=adresse-centre]')
      .type(centre2.adresse)
    cy.get('.t-create-centre-form')
      .find('[name=geo-departement-centre]')
      .type(centre2.geoDepartement)
    cy.get('.t-create-centre-form')
      .find('[name=lon-centre]')
      .type(centre2.lon)
    cy.get('.t-create-centre-form')
      .find('[name=lat-centre]')
      .type(centre2.lat)
    cy.get(
      '.t-create-centre-form  .t-create-center-select-departement  .v-input__slot',
    ).click()
    cy.get('.v-list-item')
      .contains(centre2.departement)
      .click()

    cy.get('.t-create-centre-submit').click()

    cy.get('.t-list-centres')
      .find('.t-centre-list-header-name')
      .click({ force: true })

    cy.get('.t-list-centres')
      .should('contain', centre2.nom)
      .contains(centre2.nom)
      .parents('tr')
      .find('.t-centre-edit-btn')
      .click({ force: true })

    cy.get('.v-dialog--active  .t-update-centre-form')
      .within(($inForm) => {
        cy.get('[name=nom-centre]')
          .should('have.value', centre2.nom)
          .type('{selectall}{backspace}')
          .type(centre2.nom + ' UPDATED')
          .blur()
        cy.get('[name=geo-departement-centre]')
          .should('have.value', centre2.geoDepartement)
          .type('{selectall}{backspace}')
          .type('2B')
          .blur()
      })
    cy.get('.v-dialog--active')
      .find('.t-update-centre-submit')
      .click()

    cy.get('.t-list-centres').should('contain', centre2.nom + ' UPDATED')
    cy.get('.t-list-centres')
      .should('contain', centre2.departement)
    cy.get('.t-list-centres')
      .should('contain', centre2.nom)
    cy.get('.t-list-centres')
      .should('contain', centre2.adresse)
    cy.get('.t-list-centres')
      .should('contain', '2B')
  })

  it('Archiver/désarchiver un centre', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin/centres')
    cy.get('.t-create-centre-form')
      .find('[name=nom-centre]')
      .type(centre3.nom)
    cy.get('.t-create-centre-form')
      .find('[name=label-centre]')
      .type(centre3.label)
    cy.get('.t-create-centre-form')
      .find('[name=adresse-centre]')
      .type(centre3.adresse)
    cy.get('.t-create-centre-form')
      .find('[name=lon-centre]')
      .type(centre3.lon)
    cy.get('.t-create-centre-form')
      .find('[name=lat-centre]')
      .type(centre3.lat)

    cy.get(
      '.t-create-centre-form  .t-create-center-select-departement  .v-input__slot',
    ).click()
    cy.get('.v-list-item')
      .contains(centre3.departement)
      .click()

    cy.get('.t-create-centre-submit').click()

    cy.get('.t-list-centres')
      .find('.t-centre-list-header-name')
      .click({ force: true })

    cy.get('.t-list-centres')
      .should('contain', centre3.nom)
      .contains(centre3.nom)
      .parents('tr')
      .find('.t-archive-centre-icon')
      .click({ force: true })

    cy.get('.v-dialog--active')
      .find('.t-archive-centre-submit')
      .click()

    cy.get('.t-list-centres')
      .should('contain', centre3.nom)
      .contains(centre3.nom)
      .parents('tr')
      .find('.t-archive-centre-icon')
      .should('contain', 'restore_from_trash')

    cy.get('.t-list-centres')
      .should('contain', centre3.nom)
      .contains(centre3.nom)
      .parents('tr')
      .find('.t-archive-centre-icon')
      .click({ force: true })

    cy.get('.v-dialog--active')
      .find('.t-archive-centre-submit')
      .click()

    cy.get('.t-list-centres')
      .should('contain', centre3.nom)
      .contains(centre3.nom)
      .parents('tr')
      .find('.t-archive-centre-icon')
      .should('contain', 'trash')
  })
})
