/* Tests :
- The delay before trying again after failure
*/

const { now } = require('../support/dateUtils')

// Initialise magicLink
var magicLink

describe('Test delay after failed attempt', () => {
  if (Cypress.env('VUE_APP_CLIENT_BUILD_INFO') !== 'COVID') {
    before(() => {
    // Delete all mails before start
      cy.deleteAllMails()
      // Creates the aurige files
      cy.writeFile(Cypress.env('filePath') + '/aurige.json',
        [
          {
            codeNeph: Cypress.env('candidatDelayAfterFailureNeph'),
            nomNaissance: Cypress.env('candidatDelayAfterFailure'),
            email: Cypress.env('emailCandidatDelayAfterFailure'),
            dateReussiteETG: new Date(),
            nbEchecsPratiques: '1',
            dateDernierNonReussite: Cypress.env('dateFail'),
            objetDernierNonReussite: 'echec',
            reussitePratique: '',
            candidatExistant: 'OK',
          },
        ])
      cy.adminLogin()
      // cy.archiveCandidate()
      cy.addPlanning()
      cy.adminDisconnection()
      cy.updatePlaces({}, { createdAt: now.minus({ days: 2 }).toUTC() }, true)
    })

    it('Goes to the reservation page and can\'t add reservation', () => {
    // cy.candidatePreSignUp()
    // The admin validates the candidate via Aurige
      cy.adminLogin()
      cy.contains('import_export')
        .click()
      cy.get('.ag-overlay')
        .should('contain', 'No Rows To Show')
      const filePath2 = '../../../' + Cypress.env('filePath') + '/aurige.json'
      const fileName2 = 'aurige.json'
      cy.get('.input-file-container [type=file]')
        .attachFile({
          filePath: filePath2,
          fileName: fileName2,
          mimeType: 'application/json',
        })

      cy.get('.v-snack--active')
        .should('contain', fileName2 + ' prêt à être synchronisé')
      cy.get('.import-file-action [type=button]')
        .click()
      cy.get('.v-snack--active')
        .should('contain', 'Le fichier ' + fileName2 + ' a été synchronisé.')
      // Checks that the candidate is validated
      cy.get('.ag-cell')
        .should('contain', 'CANDIDAT_DELAY_AFTER_FAILURE')
      cy.get('.ag-cell')
        .should('contain', 'Pour le 75, ce candidat ' + 'candidat_delay_after_failure@candi.lib' + ' a été mis à jour')
      // Disconnects from the app
      cy.adminDisconnection()
      // The candidate gets the link
      cy.candidatConnection('candidat_delay_after_failure@candi.lib')
      cy.getLastMail().its('Content.Body').then((mailBody) => {
        const codedLink = mailBody.split('href=3D"')[1].split('">')[0]
        const withoutEq = codedLink.replace(/=\r\n/g, '')
        magicLink = withoutEq.replace(/=3D/g, '=')
      }).then(($link) => {
        cy.visit(magicLink)
      })

      // Tries to add the reservation
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
      cy.get('.v-alert.warning')
        .should('contain', 'Vous avez échoué le ' + Cypress.env('dateFailLong') + ' à l\'examen pratique du permis de conduire. Vous ne pouvez sélectionner une date qu\'à partir du ' + Cypress.env('timeoutToRetry') + '.')
      cy.get('.v-tabs')
        .should('not.have.class', 'primary--text')
      cy.get('.t-disconnect')
        .click()
      cy.url()
        .should('contain', 'candidat-presignup')
    })
  } else {
    it('skip for message CODIV 19', () => { cy.log('skip for message CODIV 19') })
  }
})
