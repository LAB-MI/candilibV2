import {
  now,
} from '../support/dateUtils'

describe('Manage centers', () => {
  const centre1 = {
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
    cy.deleteCentres([centre1, centre2, centre3, { nom: centre2.nom + ' UPDATED' }])
  })

  beforeEach(() => {
    cy.deleteAllPlaces()
  })
  afterEach(() => {
    cy.adminDisconnection()
  })

  after(() => {
    cy.deleteCentres([centre1, centre2, centre3, { nom: centre2.nom + ' UPDATED' }])
  })

  const cyCreateCentre = (centre) => {
    cy.get('.t-create-centre-form')
      .find('[name=nom-centre]')
      .type(centre.nom)
    cy.get('.t-create-centre-form')
      .find('[name=label-centre]')
      .type(centre.label)
    cy.get('.t-create-centre-form')
      .find('[name=adresse-centre]')
      .type(centre.adresse)
    if (centre.geoDepartement) {
      cy.get('.t-create-centre-form')
        .find('[name=geo-departement-centre]')
        .type(centre2.geoDepartement)
    }
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

    cy.get('.t-create-centre-submit').click()
  }

  it('Ajouter un centre', () => {
    const centre = centre1
    cy.delegueLogin()
    cy.visit(Cypress.env('frontAdmin') + 'admin/centres')
    cyCreateCentre(centre)

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
    const centre = centre2
    cy.adminLogin()
    cy.visit(Cypress.env('frontAdmin') + 'admin/centres')
    cyCreateCentre(centre)

    cy.get('.t-list-centres')
      .find('.t-centre-list-header-name')
      .click({ force: true })

    cy.get('.t-list-centres')
      .should('contain', centre.nom)
      .contains(centre.nom)
      .parents('tr')
      .find('.t-centre-edit-btn')
      .click({ force: true })

    cy.get('.v-dialog--active  .t-update-centre-form')
      .within(($inForm) => {
        cy.get('[name=nom-centre]')
          .should('have.value', centre.nom)
          .type('{selectall}{backspace}')
          .type(centre.nom + ' UPDATED')
          .blur()
        cy.get('[name=geo-departement-centre]')
          .should('have.value', centre.geoDepartement)
          .type('{selectall}{backspace}')
          .type('2B')
          .blur()
      })
    cy.get('.v-dialog--active')
      .find('.t-update-centre-submit')
      .click()

    cy.get('.t-list-centres').should('contain', centre.nom + ' UPDATED')
    cy.get('.t-list-centres')
      .should('contain', centre.departement)
    cy.get('.t-list-centres')
      .should('contain', centre.nom)
    cy.get('.t-list-centres')
      .should('contain', centre.adresse)
    cy.get('.t-list-centres')
      .should('contain', '2B')
  })

  context("Deactivation d'un centre", () => {
    const cyClickAndCheckArchiveCentre = (centre, message, iconName) => {
      cy.get('.t-list-centres')
        .should('contain', centre.nom)
        .contains(centre.nom)
        .parents('tr')
        .find('.t-archive-centre-icon')
        .click({ force: true })

      cy.get('.v-dialog--active')
        .find('.t-archive-centre-submit')
        .click()

      cy.checkAndCloseSnackBar(message)
      cy.get('.t-list-centres')
        .should('contain', centre.nom)
        .contains(centre.nom)
        .parents('tr')
        .find('.t-archive-centre-icon')
        .should('contain', iconName)
    }
    it('Archiver/désarchiver un centre', () => {
      const centre = centre3
      cy.adminLogin()
      cy.visit(Cypress.env('frontAdmin') + 'admin/centres')
      cyCreateCentre(centre)

      cy.get('.t-list-centres')
        .find('.t-centre-list-header-name')
        .click({ force: true })

      cyClickAndCheckArchiveCentre(centre, 'Le centre a bien été ', 'restore_from_trash')
      cyClickAndCheckArchiveCentre(centre, 'Le centre a bien été ', 'delete')
    })

    const cyArchiveCentre = (centre, date, filename, defaultPlaces, message, iconName) => {
      cy.adminLogin()
      cy.addPlanning(
        date,
        filename,
        centre.nom,
        defaultPlaces,
      )

      cy.visit(Cypress.env('frontAdmin') + 'admin/centres')

      cyClickAndCheckArchiveCentre(centre, message, iconName)
    }
    // suite de 'Archiver/désarchiver un centre'
    it("Echec d'archivage d'un centre avec un place dans le future", () => {
      cyArchiveCentre(centre3,
        undefined,
        'planningArchvieCentre.csv',
        true,
        'Le centre possède des places à venir', 'delete')
    })

    it('Archiver un centre avec un place dans le passé', () => {
      cyArchiveCentre(centre3,
        [now.minus({ days: 1 })],
        'planningArchvieCentre1.csv',
        false,
        'Le centre a bien été ',
        'restore_from_trash')
    })
  })
})
