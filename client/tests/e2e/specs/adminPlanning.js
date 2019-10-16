/* Tests :
- Checks the display of the date
- Tests the next week button
- Removes a time slot
- Adds a time slot
- Assigns a candidate
- Change the inspector
- Cancels a reservation
- Sends the mail to the inspectors
- Sends the mail to the admin
- Import a CSV file
- Removes the morning of an inspector
- Removes the afternoon of an inspector
- Removes the whole day of an inspector
*/

describe('Planning tests', () => {
  before(() => {
    // Delete all mails before start
    cy.mhDeleteAll()
    cy.adminLogin()
    cy.archiveCandidate()
    cy.addPlanning()
    cy.addToWhitelist()
    cy.adminDisconnection()
    cy.candidatePreSignUp()
    // The admin validates the candidate via Aurige
    cy.adminLogin()
    cy.candidateValidation()
    // Disconnects from the app
    cy.adminDisconnection()
  })

  it('Assigns a candidate and changes the inspector', () => {
    cy.adminLogin()
    // Goes to planning and add candidate to the first place
    cy.addCandidatToPlace()
    cy.get('.v-snack')
      .should('contain', Cypress.env('candidat'))
      .and('contain', 'a bien été affecté à la place')
    cy.mhGetFirstRecipients()
      .should('contain', Cypress.env('emailCandidat'))
    cy.mhGetFirstSubject()
      .should('contain', '=?UTF-8?Q?Convocation_=C3=A0_l=27examen_pratique_d?= =?UTF-8?Q?u_permis_de_conduire?=')
    cy.mhGetFirstBody()
      .should('contain', Cypress.env('centre').toUpperCase())
    // Change the inspector
    cy.get('.v-window-item').not('[style="display: none;"]')
      .contains(Cypress.env('inspecteur'))
      .parents('tbody').within(($row) => {
        cy.get('.place-button')
          .contains('face')
          .click()
        cy.contains('Modifier l\'inspecteur')
          .click()
        cy.get('[type=text]')
          .type(Cypress.env('inspecteur2') + '{enter}')
        cy.root()
          .should('contain', 'Vous avez choisi l\'inspecteur ' + Cypress.env('inspecteur2'))
        cy.get('button')
          .contains('Valider')
          .click()
      })
    cy.get('.v-snack')
      .should('contain', 'La modification est confirmée.')
    // Add the place back
    cy.get('.v-window-item').not('[style="display: none;"]')
      .contains(Cypress.env('inspecteur'))
      .parents('tbody').within(($row) => {
        cy.get('.place-button')
          .contains('block')
          .click()
        cy.contains('Rendre le créneau disponible')
          .click()
      })
    cy.get('.v-snack')
      .should('contain', 'a bien été crée')
    // Sends the mail for the inspectors
    cy.mhDeleteAll()
    cy.get('button')
      .contains('Envoyer les bordereaux aux inspecteurs du')
      .click()
    cy.get('.v-dialog')
      .contains('Envoyer les bordereaux aux inspecteurs du')
      .parents('.v-dialog')
      .find('[type=submit]')
      .contains('Envoyer')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Les emails ont bien été envoyés')
      .contains('close')
      .click({ force: true })
    cy.mhGetAllMails()
      .should('have.length', 1)
    cy.mhGetFirstRecipients()
      .should('contain', Cypress.env('emailInspecteur'))
    cy.mhGetFirstSubject()
      .should('contain', '=?UTF-8?Q?Bordereau_de_l=27inspecteur_')
    cy.mhGetFirstBody()
      .should('contain', Cypress.env('centre'))
      .and('contain', Cypress.env('candidat'))
    // Receive the mail for the inspectors
    cy.mhDeleteAll()
    cy.get('button')
      .contains('Recevoir les bordereaux des inspecteurs du')
      .click()
    cy.get('.v-dialog')
      .contains('Recevoir les bordereaux des inspecteurs du')
      .parents('.v-dialog')
      .should('contain', Cypress.env('emailRepartiteur'))
      .find('[type=submit]')
      .contains('Envoyer')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Les emails ont bien été envoyés')
      .contains('close')
      .click({ force: true })
    cy.mhGetAllMails()
      .should('have.length', 1)
    cy.mhGetFirstRecipients()
      .should('contain', Cypress.env('emailRepartiteur'))
    cy.mhGetFirstSubject()
      .should('contain', '=?UTF-8?Q?Bordereau_de_l=27inspecteur_')
    cy.mhGetFirstBody()
      .should('contain', Cypress.env('centre'))
      .and('contain', Cypress.env('candidat'))
    // Removes the candidate from the place
    cy.get('.v-window-item').not('[style="display: none;"]')
      .contains(Cypress.env('inspecteur2'))
      .parents('tbody').within(($row) => {
        cy.get('.place-button')
          .contains('face')
          .click()
        cy.contains('Annuler réservation')
          .click()
        cy.contains('Supprimer réservation')
          .click()
      })
    cy.get('.v-snack')
      .should('contain', 'La réservation choisie a été annulée.')
    cy.mhGetFirstRecipients()
      .should('contain', Cypress.env('emailCandidat'))
    cy.mhGetFirstSubject()
      .should('contain', '=?UTF-8?Q?Annulation_de_votre_convocation_=C3=A0_l?= =?UTF-8?Q?=27examen_par_l=27administration?=')
    // Add the place back
    cy.get('.v-window-item').not('[style="display: none;"]')
      .contains(Cypress.env('inspecteur2'))
      .parents('tbody').within(($row) => {
        cy.get('.place-button')
          .contains('block')
          .click()
        cy.contains('Rendre le créneau disponible')
          .click()
      })
    cy.get('.v-snack')
      .should('contain', 'a bien été crée.')
  })
})

describe('Planning tests without candidate', () => {
  before(() => {
    cy.adminLogin()
    cy.addPlanning()
    cy.adminDisconnection()
  })

  it('Adds and removes places', () => {
    cy.adminLogin()
    // Goes to planning
    cy.contains('calendar_today').click()
    // Checks the center in the 93
    cy.get('.hexagon-wrapper').contains('93')
      .click()
    cy.get('.v-tabs__div')
      .should('contain', 'Bobigny')
    // Checks if the url matches the date displayed
    cy.get('.hexagon-wrapper').contains('75')
      .click()
    cy.get('.t-btn-next-week')
      .click()
    cy.url()
      .then(($url) => {
        let url = $url.split('/')
        let date = url[url.length - 1]
        let ymd = date.split('-')
        cy.get('.t-date-picker [type=text]').invoke('val')
          .should('contain', ymd[2] + '/' + ymd[1] + '/' + ymd[0])
      })
    // Goes to another date and checks the url
    cy.visit(Cypress.env('frontAdmin') + 'admin/gestion-planning/*/' + Cypress.env('placeDate'))
    cy.url()
      .then(($url) => {
        let url = $url.split('/')
        let date = url[url.length - 1]
        let ymd = date.split('-')
        cy.get('.t-date-picker [type=text]').invoke('val')
          .should('contain', ymd[2] + '/' + ymd[1] + '/' + ymd[0])
      })
    // Deletes the first place
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
    cy.get('.v-snack')
      .should('contain', 'a bien été supprimée de la base')
    // Add the first place
    cy.get('.v-window-item').not('[style="display: none;"]')
      .contains(Cypress.env('inspecteur'))
      .parents('tbody').within(($row) => {
        cy.get('.place-button')
          .contains('block')
          .click()
        cy.contains('Rendre le créneau disponible')
          .click()
      })
    cy.get('.v-snack')
      .should('contain', 'a bien été crée')
  })

  it('Tests the import of csv files in the planning', () => {
    cy.adminLogin()
    // Goes to where the places are
    cy.visit(Cypress.env('frontAdmin') + 'admin/gestion-planning/*/' + Cypress.env('placeDate'))
    cy.get('.v-tabs')
      .contains(Cypress.env('centre'))
      .click({ force: true })
    // Removes the inspector's places
    cy.get('.v-window-item').not('[style="display: none;"]')
      .should('have.length', 1)
      .and('contain', Cypress.env('inspecteur')) // To ensure retry-ability
      .contains(Cypress.env('inspecteur'))
      .parents('tbody')
      .should('not.contain', 'block')
      .within(($row) => {
        // Removes the morning
        cy.contains('delete')
          .click()
        cy.contains('Supprimer la matinée')
          .click()
        cy.contains('Valider')
          .click()
      })
    cy.get('.v-snack')
      .should('contain', 'La suppression des places sélectionnées a bien été effectuée')
    cy.get('.v-window-item').not('[style="display: none;"]')
      .contains(Cypress.env('inspecteur2'))
      .parents('tbody')
      .should('not.contain', 'block')
      .within(($row) => {
        // Removes the afternoon
        cy.contains('delete')
          .click()
        cy.contains('Supprimer l\'après-midi')
          .click()
        cy.contains('Valider')
          .click()
      })
    cy.get('.v-snack')
      .should('contain', 'La suppression des places sélectionnées a bien été effectuée')
    cy.get('.v-window-item').not('[style="display: none;"]')
      .contains(Cypress.env('inspecteur2'))
      .parents('tr').within(($row) => {
        cy.get(':nth-child(9)')
          .should('contain', 'check_circle')
        cy.get(':nth-child(10)')
          .should('contain', 'block')
      })
    cy.get('.v-window-item').not('[style="display: none;"]')
      .contains(Cypress.env('inspecteur'))
      .parents('tr')
      .within(($row) => {
        cy.get(':nth-child(9)')
          .should('contain', 'block')
        cy.get(':nth-child(10)')
          .should('contain', 'check_circle')
        // Removes the entire day
        cy.contains('delete')
          .click()
        cy.root().parent()
          .contains('Supprimer la journée')
          .click()
        cy.root().parent()
          .contains('Valider')
          .click()
      })
    // The inspector should not be present anymore
    cy.get('.name-ipcsr-wrap')
      .should('not.contain', Cypress.env('inspecteur'))
    // Imports the places
    cy.addPlanning()
    // The inspector should be back
    cy.contains('replay')
      .click()
    cy.get('.v-tabs')
      .contains(Cypress.env('centre'))
      .click({ force: true })
    cy.get('.name-ipcsr-wrap')
      .should('contain', Cypress.env('inspecteur'))
  })
})
