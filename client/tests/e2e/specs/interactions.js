import { date1, now } from '../support/dateUtils'

/* Tests :
- The candidate reservation is visible on the admin front
- The reservation made by the admin is visible on the candidate front
- The reservation cancelled by the candidate disappears on the admin front
- The reservation cancelled by the admin disappears on the candidate front
- The candidate receives a mail when the admin cancels his reservation
- The candidate can't see disabled time slots
*/

// Initialise magicLink
var magicLink

describe('Standard scenarios', () => {
  if (Cypress.env('VUE_APP_CLIENT_BUILD_INFO') !== 'COVID') {
    before(() => {
      cy.deleteAllMails()
      cy.adminLogin()
      cy.archiveCandidate()
      cy.addPlanning()
      cy.adminDisconnection()
      cy.adminLogin()
      cy.adminDisconnection()
      cy.candidatConnection(Cypress.env('emailCandidatInteractive'))

      cy.getLastMail().its('Content.Body').then((mailBody) => {
        const codedLink = mailBody.split('href=3D"')[1].split('">')[0]
        const withoutEq = codedLink.replace(/=\r\n/g, '')
        magicLink = withoutEq.replace(/=3D/g, '=')
      })
      cy.updatePlaces({}, { createdAt: now.minus({ days: 2 }).toUTC() }, true)
    })

    it('The candidate chooses a place and the admin cancels it', () => {
      cy.visit(magicLink)
      // Adds the reservation
      cy.get('h2')
        .should('contain', 'Choix du département')
      cy.contains(Cypress.env('geoDepartement'))
        .click()
      cy.wait(100)

      cy.get('h2')
        .should('contain', 'Choix du centre')
      cy.contains(Cypress.env('centre'))
        .click()
      cy.wait(100)

      cy.get(`[href="#tab-${date1.monthLong}"]`)
        .click()
      cy.contains(' ' + Cypress.env('placeDate').split('-')[2] + ' ')
        .parents('.t-time-slot-list-group')
        .within(($date) => {
          cy.root().click()
          cy.contains('08h00-08h30')
            .click()
        })
      cy.get('h2')
        .should('contain', 'Confirmation')
      cy.get('h3')
        .should('contain', Cypress.env('centre'))
      cy.get('[type=checkbox]')
        .first().check({ force: true })
      cy.get('[type=checkbox]')
        .last().check({ force: true })
      cy.get('button')
        .contains('Confirmer')
        .click()
      cy.get('.v-snack--active')
        .should('contain', 'Votre réservation a bien été prise en compte')
      cy.get('h2')
        .should('contain', 'Ma réservation')
      cy.get('h3')
        .should('contain', Cypress.env('centre'))
      cy.get('p')
        .should('contain', 'à 08:00')
      // Check candidate profile
      cy.contains('supervised_user_circle')
        .click()
      cy.contains('Nom de naissance')
        .parent().parent()
        .should('contain', Cypress.env('candidatInteractive'))
      // The admin connects
      cy.adminLogin()
      // The admin find the reservation and cancels it
      cy.visit(Cypress.env('frontAdmin') + 'admin/gestion-planning/*/' + Cypress.env('placeDate'))
      cy.get('.t-center-tabs .v-tab')
        .contains(Cypress.env('centre'))
        .click({ force: true })
      cy.contains('replay')
        .click()
      cy.get('.v-window-item').not('[style="display: none;"]')
        .should('have.length', 1)
        .and('contain', Cypress.env('inspecteur')) // To ensure retry-ability
        .within(($centre) => {
          cy.get('.place-button')
            .contains('face')
            .parents('tbody').within(($row) => {
              cy.get('.place-button')
                .contains('face')
                .click()
              cy.get('.place-details')
                .should('contain', Cypress.env('candidatInteractive'))
              cy.contains('Annuler réservation')
                .click()
              cy.contains('Supprimer réservation')
                .click()
            })
        })
      cy.get('.v-snack--active')
        .should('contain', 'La réservation choisie a été annulée.')
      // Add the place back
      cy.get('.v-window-item').not('[style="display: none;"]')
        .within(($centre) => {
          cy.get('.place-button')
            .contains('block')
            .parents('tbody').within(($row) => {
              cy.get('.place-button')
                .contains('block')
                .click()
              cy.contains('Rendre le créneau disponible')
                .click()
            })
        })
      cy.get('.v-snack--active')
        .should('contain', 'a bien été créée.')
      // The candidate doesn't have the reservation anymore
      cy.visit(magicLink)
      cy.get('h2')
        .should('contain', 'Choix du département')
      // Check candidate profile
      cy.contains('supervised_user_circle')
        .click()
      cy.contains('Nom de naissance')
        .parent().parent()
        .should('contain', Cypress.env('candidatInteractive'))
    })

    it('The admin assigns a candidate and the candidate cancels it', () => {
    // Check the candidate
      cy.visit(magicLink)
      cy.get('h2')
        .should('contain', 'Choix du département')
      cy.contains('supervised_user_circle')
        .click()
      cy.contains('Nom de naissance')
        .parent().parent()
        .should('contain', Cypress.env('candidatInteractive'))
      // The admin assigns the candidate to a place
      cy.adminLogin()
      // Goes to planning
      cy.visit(Cypress.env('frontAdmin') + 'admin/gestion-planning/*/' + Cypress.env('placeDate'))
      cy.get('.t-center-tabs .v-tab')
        .contains(Cypress.env('centre'))
        .click({ force: true })
      // Add candidate to the first place
      cy.get('.v-window-item').not('[style="display: none;"]')
        .should('have.length', 1)
        .and('contain', Cypress.env('inspecteur')) // To ensure retry-ability
        .contains(Cypress.env('inspecteur'))
        .parents('tbody').within(($row) => {
          cy.get('.place-button')
            .contains('check_circle')
            .click()
          cy.contains('Affecter un candidat')
            .click()
          cy.get('.search-input [type=text]')
            .type(Cypress.env('candidatInteractive'))
          cy.root().parents().contains(Cypress.env('candidatInteractive'))
            .click()
          cy.get('.place-details')
            .should('contain', Cypress.env('centre'))
          cy.contains('Valider')
            .click()
        })
      cy.get('.v-snack--active')
        .should('contain', Cypress.env('candidatInteractive'))
        .and('contain', 'a bien été affecté à la place')
      // The candidate cancels the place
      cy.visit(magicLink)
      cy.get('h2')
        .should('contain', 'Ma réservation')
      cy.get('h3')
        .should('contain', Cypress.env('centre'))
      cy.get('p')
        .should('contain', 'à 07:00')
      cy.contains('Annuler ma réservation')
        .click()
      cy.get('button')
        .contains('Confirmer')
        .click()
      cy.get('.v-snack--active')
        .should('contain', 'Votre annulation a bien été prise en compte.')
      cy.get('h2')
        .should('contain', 'Choix du département')
      // The admin Checks that the reservation has been cancelled
      cy.visit(Cypress.env('frontAdmin') + 'admin/gestion-planning/*/' + Cypress.env('placeDate'))
      cy.get('.t-center-tabs .v-tab')
        .contains(Cypress.env('centre'))
        .click({ force: true })
      cy.wait(100)

      cy.get('.v-window-item').not('[style="display: none;"]')
        .should('have.length', 1)
        .and('contain', Cypress.env('inspecteur')) // To ensure retry-ability
        .contains(Cypress.env('inspecteur'))
        .parents('tbody')
        .find('.place-button')
        .should('not.contain', 'face')
    })

    it('The admin disables a time slot', () => {
    // Will only work if the places in db were cleared first.
      cy.visit(magicLink)
      // The 8:00 slot should be there
      cy.get('h2')
        .should('contain', 'Choix du département')
      cy.contains(Cypress.env('geoDepartement'))
        .click()
      cy.wait(100)
      cy.get('h2')
        .should('contain', 'Choix du centre')
      cy.contains(Cypress.env('centre'))
        .click()
      cy.get(`[href="#tab-${date1.monthLong}"]`)
        .click()
      cy.contains(' ' + Cypress.env('placeDate').split('-')[2] + ' ')
        .parents('.t-time-slot-list-group')
        .within(($date) => {
          cy.root().click()
          cy.should('contain', '08h00-08h30')
        })
      // The admin deletes the places
      cy.adminLogin()
      cy.visit(Cypress.env('frontAdmin') + 'admin/gestion-planning/*/' + Cypress.env('placeDate'))
      cy.get('.t-center-tabs .v-tab')
        .contains(Cypress.env('centre'))
        .click({ force: true })
      cy.contains('replay')
        .click()
      // Deletes for the first inspector
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
      // Deletes for the second inspector
      cy.get('.v-window-item').not('[style="display: none;"]')
        .should('contain', Cypress.env('inspecteur2')) // To ensure retry-ability
        .contains(Cypress.env('inspecteur2'))
        .parents('tbody').within(($row) => {
          cy.get('.place-button')
            .contains('check_circle')
            .click()
          cy.contains('Rendre indisponible')
            .click()
        })
      cy.get('.v-snack--active')
        .should('contain', 'a bien été supprimée de la base')
      cy.get('.t-disconnect')
        .click()
      cy.visit(magicLink)
      // The 8:00 slot should not be there anymore
      cy.get('h2')
        .should('contain', 'Choix du département')
      cy.contains(Cypress.env('geoDepartement'))
        .click()
      cy.get('h2')
        .should('contain', 'Choix du centre')
      cy.contains(Cypress.env('centre'))
        .click()
      cy.get(`[href="#tab-${date1.monthLong}"]`)
        .click()
      cy.contains(' ' + Cypress.env('placeDate').split('-')[2] + ' ')
        .parents('.t-time-slot-list-group')
        .within(($date) => {
          cy.root().click()
          cy.should('not.contain', '07h00-07h30')
            .and('contain', '08h30-09h00')
        })
    })
  } else {
    it('skip for message CODIV 19', () => { cy.log('skip for message CODIV 19') })
  }
})
