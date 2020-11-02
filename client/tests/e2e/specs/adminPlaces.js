/* Tests :
- Display of colours when there is or not available places on the dashboard
  - Red if less than half of the places from the week have been reserved
  - Orange if at least half have been reserved
  - Green if all have been reserved
  (Tests with only two places available during the week)
*/

describe('Places tests', () => {
  before(() => {
    const csvHeaders = 'Date,Heure,Inspecteur,Non,Centre,Departement'
    const horaires = [
      '08:00',
      '08:30',
    ]
    const csvRowBuilder = (inspecteur, matricule) => horaire => `${Cypress.env('datePlace2')},${horaire},${matricule},${inspecteur},${Cypress.env('centre')},75`
    const placesInspecteur1 = horaires.map(csvRowBuilder(Cypress.env('inspecteur'), Cypress.env('matricule')))
    const placesArray = [csvHeaders].concat(placesInspecteur1).join('\n')
    // Delete all mails before start
    cy.deleteAllMails()
    cy.adminLogin()
    cy.archiveCandidate()
    // Creates the csv file
    cy.writeFile(Cypress.env('filePath') + '/planning.csv', placesArray)
    // Adds the places from the created planning file
    cy.contains('calendar_today')
      .click()
    cy.get('.t-import-places')
      .click()
    const filePath1 = '../../../' + Cypress.env('filePath') + '/planning.csv'
    const fileName1 = 'planning.csv'
    cy.fixture(filePath1).then(fileContent => {
      cy.get('[type=file]').attachFile({ fileContent, fileName: fileName1, mimeType: 'text/csv' })
    })
    cy.get('.v-snack--active')
      .should('contain', fileName1 + ' prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click({ force: true })
    cy.get('.v-snack--active', { timeout: 10000 })
      .should('contain', 'Le fichier ' + fileName1 + ' a été traité pour le departement 75.')
    cy.get('.t-close-btn-import-places').click()
    cy.adminDisconnection()
  })

  it('Checks the colours on the dashboard', () => {
    cy.adminLogin()
    // Checks the places on the dashboard
    cy.get('h2.title')
      .should('contain', Cypress.env('centre'))
      .contains(Cypress.env('centre'))
      .parents('.monitor-wrapper').within(($centre) => {
        cy.contains(Cypress.env('nextDate'))
          .parents('.th-ui-week-column')
          .should('have.class', 'red')
          .parents('tr')
          .find('button').first()
          .click()
      })
    // Checks the planning
    cy.url()
      .should('contain', Cypress.env('placeDate2'))
    cy.get('.t-date-picker [type=text]').invoke('val')
      .should('contain', Cypress.env('dateLong2'))
    cy.get('.v-tab--active')
      .should('contain', Cypress.env('centre'))
    // Add candidate to the first place
    cy.get('.v-window-item').not('[style="display: none;"]')
      .should('have.length', 1)
      .and('contain', Cypress.env('inspecteur'))
      .contains(Cypress.env('inspecteur'))
      .parents('tbody').within(($row) => {
        cy.get('.place-button')
          .contains('check_circle')
          .click()
        cy.contains('Affecter un candidat')
          .click()
        cy.get('.search-input [type=text]')
          .type('CANDIDAT_FRONT')
        cy.root().parents().contains('CANDIDAT_FRONT')
          .click()
        cy.get('.place-details')
          .should('contain', Cypress.env('centre'))
        cy.contains('Valider')
          .click()
      })
    cy.get('.v-snack--active')
      .should('contain', 'CANDIDAT_FRONT')
      .and('contain', 'a bien été affecté à la place')
      .contains('close').click()
    // Should be orange on the dashboard
    cy.get('.home-link')
      .click()
    cy.get('h2.title')
      .should('contain', Cypress.env('centre'))
      .contains(Cypress.env('centre'))
      .parents('.monitor-wrapper').within(($centre) => {
        cy.contains(Cypress.env('nextDate'))
          .parents('.th-ui-week-column')
          .should('have.class', 'orange')
          .parents('tr')
          .find('button').first()
          .click()
      })
    cy.url()
      .should('contain', Cypress.env('placeDate2'))
    cy.get('.t-date-picker [type=text]').invoke('val')
      .should('contain', Cypress.env('dateLong2'))
    cy.get('.v-tab--active')
      .should('contain', Cypress.env('centre'))
    // Deletes the second place
    cy.get('.v-tabs')
      .contains(Cypress.env('centre'))
      .click({ force: true })
    cy.contains('replay')
      .click()
    cy.get('.v-window-item').not('[style="display: none;"]')
      .should('have.length', 1, { timeout: 10000 })
      .and('contain', Cypress.env('inspecteur')) // To ensure retry-ability
      .contains(Cypress.env('inspecteur'))
      .parents('tbody').within(($row) => {
        cy.get('.place-button')
          .contains('check_circle')
          .click()
        cy.contains('Rendre indisponible')
          .click()
      })
    cy.get('.v-snack--active')
      .should('contain', 'a bien été supprimée de la base')
      .contains('close').click()
    // Should be green on the dashboard
    cy.get('.home-link')
      .click()
    cy.get('h2.title')
      .should('contain', Cypress.env('centre'))
      .contains(Cypress.env('centre'))
      .parents('.monitor-wrapper').within(($centre) => {
        cy.contains(Cypress.env('nextDate'))
          .parents('.th-ui-week-column')
          .should('have.class', 'green')
          .parents('tr')
          .find('button').first()
          .click()
      })
    cy.url()
      .should('contain', Cypress.env('placeDate2'))
    cy.get('.t-date-picker [type=text]').invoke('val')
      .should('contain', Cypress.env('dateLong2'))
    cy.get('.v-tab--active')
      .should('contain', Cypress.env('centre'))
    // Removes the candidate from the place
    cy.get('.v-window-item').not('[style="display: none;"]')
      .should('have.length', 1)
      .contains(Cypress.env('inspecteur'))
      .parents('tbody').within(($row) => {
        cy.get('.place-button')
          .contains('face')
          .click()
        cy.contains('Annuler réservation')
          .click()
        cy.contains('Supprimer réservation')
          .click()
      })
    cy.get('.v-snack--active')
      .should('contain', 'La réservation choisie a été annulée.')
  })
})
