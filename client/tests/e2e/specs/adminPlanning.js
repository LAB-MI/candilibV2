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
    cy.deleteAllMails()
    cy.adminLogin()
    cy.addPlanning()
    cy.adminDisconnection()
  })

  it('Assigns a candidate, send bordereaux and changes the inspector of booked place', () => {
    cy.adminLogin()
    // Goes to planning and add candidate to the first place
    cy.addCandidatToPlace(undefined, 'CANDIDAT_FRONT')
    cy.get('.v-snack--active')
      .should('contain', 'CANDIDAT_FRONT')
      .and('contain', 'a bien été affecté à la place')
    cy.getLastMail().getRecipients()
      .should('contain', 'candidat_front@candi.lib')
    cy.getLastMail().getSubject()
      .should('contain', '=?UTF-8?Q?Convocation_=C3=A0_l=27examen_pratique_d?= =?UTF-8?Q?u_permis_de_conduire?=')
    cy.getLastMail().its('Content.Body')
      .should('contain', Cypress.env('centre').toUpperCase())
    // Change the inspector

    cy.get('.v-window-item').not('[style="display: none;"]')
      .contains(Cypress.env('inspecteur'))
      .parents('tbody').within(($row) => {
        cy.get('.place-button')
          .contains('face')
          .click()
        cy.get('tr').eq(1).within(($inTr) => {
          cy.get('button').eq(1).click()
          cy.get('[type=text]')
            .type(Cypress.env('inspecteur2') + '{enter}')
          cy.get('.t-inspecteur-confirm-box')
            .find('.t-inspecteur-detail')
            .should('contain', Cypress.env('inspecteurPrenom') + ', ' + Cypress.env('inspecteur2'))
          cy.get('button').eq(2)
            .click()
        })
      })
    cy.get('.v-snack--active')
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
    cy.get('.v-snack--active')
      .should('contain', 'a bien été créée')
    cy.get('.v-snack--active button').should('be.visible').click({ force: true })
    // Sends the mail for the inspectors
    cy.deleteAllMails()
    cy.get('button')
      .contains('Envoyer les bordereaux aux IPCSR du')
      .click().wait(500)
    cy.get('.v-dialog')
      .contains('Envoyer les bordereaux aux IPCSR du')
      .parents('.v-dialog').as('dialogContent').within(() => {
        cy.get('.wrapper-list')
          .should('not.contain', Cypress.env('inspecteur'))
        cy.get('.wrapper-list').contains(Cypress.env('inspecteur2'))
        cy.get('.t-check-all').click()
        cy.get('[type=submit][disabled="disabled"]')
        cy.get('[type=text]').type(Cypress.env('inspecteur2'))
      })
    cy.get('.menuable__content__active .v-select-list').contains(Cypress.env('inspecteur2')).click()
    cy.get('@dialogContent').within(() => {
      cy.get('[type=submit]')
        .contains('Envoyer')
        .click()
    })
    cy.get('.v-snack--active')
      .should('contain', 'Les emails ont bien été envoyés')
      .contains('close')
      .click({ force: true })
    cy.getLastMail().getRecipients()
      .should('contain', Cypress.env('emailInspecteur'))
    cy.getLastMail().getSubject()
      .should('contain', '=?UTF-8?Q?Bordereau_de_l=27inspecteur_')
    cy.getLastMail().its('Content.Body')
      .should('contain', Cypress.env('centre'))
      .and('contain', 'CANDIDAT_FRONT')
    // Receive the mail for the inspectors
    cy.deleteAllMails()
    cy.get('button')
      .contains('Recevoir les bordereaux des IPCSR du')
      .click().wait(500)
    cy.get('.v-dialog')
      .contains('Recevoir les bordereaux des IPCSR du')
      .should('contain', Cypress.env('emailRepartiteur'))
      .parents('.v-dialog').as('dialogContent').within(() => {
        cy.get('.wrapper-list')
          .should('not.contain', Cypress.env('inspecteur'))
        cy.get('.wrapper-list').contains(Cypress.env('inspecteur2'))
        cy.get('.t-check-all').click()
        cy.get('[type=submit][disabled="disabled"]')
        cy.get('[type=text]').type(Cypress.env('inspecteur2'))
      })
    cy.get('.menuable__content__active .v-select-list').contains(Cypress.env('inspecteur2')).click()
    cy.get('@dialogContent').within(() => {
      cy.get('[type=submit]')
        .contains('Recevoir')
        .click()
    })
    cy.get('.v-snack--active')
      .should('contain', 'Les emails ont bien été envoyés')
      .contains('close')
      .click({ force: true })
    cy.getLastMail().getRecipients()
      .should('contain', Cypress.env('emailRepartiteur'))
    cy.getLastMail().getSubject()
      .should('contain', '=?UTF-8?Q?Bordereau_de_l=27inspecteur_')
    cy.getLastMail().its('Content.Body')
      .should('contain', Cypress.env('centre'))
      .and('contain', 'CANDIDAT_FRONT')
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
    cy.get('.v-snack--active')
      .should('contain', 'La réservation choisie a été annulée.')
    cy.getLastMail().getRecipients()
      .should('contain', 'candidat_front@candi.lib')
    cy.getLastMail().getSubject()
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
    cy.get('.v-snack--active')
      .should('contain', 'a bien été créée.')
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
    cy.get('.v-tab')
      .should('contain', 'BOBIGNY')
    // Checks if the url matches the date displayed
    cy.get('.hexagon-wrapper').contains('75')
      .click()
    cy.get('.t-btn-next-week')
      .click()
    cy.url()
      .then(($url) => {
        const url = $url.split('/')
        const date = url[url.length - 1]
        const ymd = date.split('-')
        cy.get('.t-date-picker [type=text]').invoke('val')
          .should('contain', ymd[2] + '/' + ymd[1] + '/' + ymd[0])
      })
    // Goes to another date and checks the url
    cy.visit(Cypress.env('frontAdmin') + 'admin/gestion-planning/*/' + Cypress.env('placeDate'))
    cy.url()
      .then(($url) => {
        const url = $url.split('/')
        const date = url[url.length - 1]
        const ymd = date.split('-')
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
    cy.get('.v-snack--active')
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
    cy.get('.v-snack--active')
      .should('contain', 'a bien été créée')
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
      .should('have.length', 1, { timeout: 10000 })
      .and('contain', Cypress.env('inspecteur')) // To ensure retry-ability
      .contains(Cypress.env('inspecteur'))
      .parents('tbody')
      .should('not.contain', 'block')
      .within(($row) => {
        // Removes the morning
        cy.get('tr').eq(0).within(($inTr) => {
          cy.get('th').within(($inTh) => {
            cy.get('button').should('contain', 'delete').click().wait(500)
          })
        })
        cy.get('tr').eq(1).within(($inTr) => {
          cy.get('td').eq(1).within(($inTd) => {
            cy.get('button').eq(1).should('contain', 'Supprimer la matinée').click().wait(500)
            cy.get('button').eq(4).should('contain', 'Valide').click()
          })
        })
      })
    cy.get('.v-snack--active')
      .should('contain', 'La suppression des places sélectionnées a bien été effectuée')
    cy.get('.v-window-item').not('[style="display: none;"]')
      .contains(Cypress.env('inspecteur2'))
      .parents('tbody')
      .should('not.contain', 'block')
      .within(($row) => {
        // Removes the morning
        cy.get('tr').eq(0).within(($inTr) => {
          cy.get('th').within(($inTh) => {
            cy.get('button').should('contain', 'delete').click().wait(500)
          })
        })
        cy.get('tr').eq(1).within(($inTr) => {
          cy.get('td').eq(1).within(($inTd) => {
            cy.get('button').eq(2).should('contain', 'Supprimer l\'après-midi').click().wait(500)
            cy.get('button').eq(4).should('contain', 'Valide').click()
          })
        })
      })
    cy.get('.v-snack--active')
      .should('contain', 'La suppression des places sélectionnées a bien été effectuée')
    cy.get('.v-window-item').not('[style="display: none;"]')
      .contains(Cypress.env('inspecteur2'))
      .parents('tr').within(($row) => {
        cy.get(':nth-child(10)')
          .should('contain', 'check_circle')
        cy.get(':nth-child(12)')
          .should('contain', 'block')
      })
    cy.get('.v-window-item').not('[style="display: none;"]')
      .contains(Cypress.env('inspecteur'))
      .parents('tr')
      .within(($row) => {
        cy.get(':nth-child(10)')
          .should('contain', 'block')
        cy.get(':nth-child(12)')
          .should('contain', 'check_circle')
        // Removes the entire day
        cy.contains('delete')
          .click()
      })
    cy.get('.v-window-item').not('[style="display: none;"]')
      .should('have.length', 1, { timeout: 500 })
      .and('contain', Cypress.env('inspecteur')) // To ensure retry-ability
      .contains(Cypress.env('inspecteur'))
      .parents('tbody').within(($row) => {
        cy.get('tr').eq(1).within(($inTr) => {
          cy.get('td').eq(1).within(($inTd) => {
            cy.get('button').eq(0).should('contain', 'Supprimer la journée').click().wait(500)
            cy.get('button').eq(4).should('contain', 'Valide').click()
          })
        })
      })
    // The inspector should not be present anymore
    cy.get('.name-ipcsr-wrap')
      .should('not.contain', Cypress.env('inspecteur'))
    // Imports the places
    cy.addPlanning()
    // Check message, when place is put in not available hours
    const getEtatValidPlanning = cy.get('.t-import-places-validation-header-status')
    getEtatValidPlanning.should('contain', 'Etat')
    getEtatValidPlanning.trigger('mouseover')
    cy.get('.t-import-places-validation-header-status .ag-cell-label-container .ag-header-cell-menu-button').click()
    cy.get('.t-ag-grid-filter-status-icon').click()
    cy.get('.t-ag-grid-filter-error').last().click()
    cy.get('[col-id=message]').should('contain', "La place n'est pas enregistrée. La place est en dehors de la plage horaire autorisée.")
    cy.get('[col-id=status]').should('contain', 'clear')
    cy.get('[col-id=status]').should('not.contain', 'done')
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
