/* Tests :
- The delay before trying again after failure
*/

// Initialise magicLink
var magicLink

describe('Test delay after failed attempt', () => {
  before(() => {
    // Delete all mails before start
    cy.deleteAllMails()
    // Creates the aurige files
    cy.writeFile(Cypress.env('filePath') + '/aurige.json',
      [
        {
          'codeNeph': Cypress.env('NEPH'),
          'nomNaissance': Cypress.env('candidat'),
          'email': Cypress.env('emailCandidat'),
          'dateReussiteETG': '2018-10-12',
          'nbEchecsPratiques': '1',
          'dateDernierNonReussite': Cypress.env('dateFail'),
          'objetDernierNonReussite': 'echec',
          'reussitePratique': '',
          'candidatExistant': 'OK',
        },
      ])
    cy.adminLogin()
    cy.archiveCandidate()
    cy.addPlanning()
    cy.addToWhitelist()
    cy.adminDisconnection()
  })

  it('Goes to the reservation page and can\'t add reservation', () => {
    cy.candidatePreSignUp()
    // The admin validates the candidate via Aurige
    cy.adminLogin()
    cy.contains('import_export')
      .click()
    cy.get('.ag-overlay')
      .should('contain', 'No Rows To Show')
    const filePath2 = '../../../' + Cypress.env('filePath') + '/aurige.json'
    const fileName2 = 'aurige.json'
    cy.fixture(filePath2).then(fileContent => {
      cy.get('.input-file-container [type=file]')
        .upload({
          fileContent: JSON.stringify(fileContent),
          fileName: fileName2,
          mimeType: 'application/json',
        })
    })
    cy.get('.v-snack')
      .should('contain', fileName2 + ' prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Le fichier ' + fileName2 + ' a été synchronisé.')
    // Checks that the candidate is validated
    cy.get('.ag-cell')
      .should('contain', Cypress.env('candidat'))
    cy.get('.ag-cell')
      .should('contain', 'Pour le 75, un magic link est envoyé à ' + Cypress.env('emailCandidat'))
    cy.getLastMail({ recipient: Cypress.env('emailCandidat') })
      .getSubject()
      .should('contain', '=?UTF-8?Q?Validation_de_votre_inscription_=C3=A0_C?= =?UTF-8?Q?andilib?=')
    // Disconnects from the app
    cy.adminDisconnection()
    // The candidate gets the link
    cy.getLastMail().getRecipients()
      .should('contain', Cypress.env('emailCandidat'))
    cy.getLastMail().getSubject()
      .should('contain', '=?UTF-8?Q?Validation_de_votre_inscription_=C3=A0_C?= =?UTF-8?Q?andilib?=')
    cy.getLastMail().its('Content.Body').then((mailBody) => {
      const codedLink = mailBody.split('href=3D"')[1].split('">')[0]
      const withoutEq = codedLink.replace(/=\r\n/g, '')
      magicLink = withoutEq.replace(/=3D/g, '=')
    }).then(($link) => {
      cy.visit(magicLink)
    })
    // Tries to add the reservation
    cy.get('h2')
      .should('contain', 'Choix du centre')
    cy.contains(Cypress.env('centre'))
      .click()
    cy.get('.v-alert.warning')
      .should('contain', 'Vous avez échoué le ' + Cypress.env('dateFailLong') + ' à l\'examen pratique du permis de conduire. Vous ne pouvez sélectionner une date qu\'à partir du ' + Cypress.env('timeoutToRetry') + '.')
    cy.get('.v-tabs')
      .should('not.have.class', 'primary--text')
    cy.get('.t-disconnect')
      .click()
    cy.get('.t-evaluation')
      .should('contain', 'Merci de noter Candilib')
    cy.get('.t-evaluation-submit')
      .click()
    cy.url()
      .should('contain', 'candidat-presignup')
  })
})
