import mesCandi from '../../../src/candidat'
/* Tests :
- Display of colours when there is or not available places on the dashboard
  - Red if less than half of the places from the week have been reserved
  - Orange if at least half have been reserved
  - Green if all have been reserved
  (Tests with only two places available during the week)
*/

const csvHeaders = 'Date,Heure,Inspecteur,Non,Centre,Departement'
const horaires = [
  '08:00',
  '08:30',
]

const csvRowBuilder = (inspecteur, matricule) => horaire => `21/10/19,${horaire},${matricule},${inspecteur},${Cypress.env('centre')},75`

const placesInspecteur1 = horaires.map(csvRowBuilder(Cypress.env('inspecteur'), Cypress.env('matricule')))

const placesArray = [csvHeaders].concat(placesInspecteur1).join('\n')

describe('Places tests', () => {
  before(() => {
    // Delete all mails before start
    cy.mhDeleteAll()
    // Creates the aurige files
    cy.writeFile('tests/e2e/files/aurige.json',
      [
        {
          'codeNeph': Cypress.env('NEPH'),
          'nomNaissance': Cypress.env('candidat'),
          'email': Cypress.env('emailCandidat'),
          'dateReussiteETG': '2018-10-12',
          'nbEchecsPratiques': '0',
          'dateDernierNonReussite': '',
          'objetDernierNonReussite': '',
          'reussitePratique': '',
          'candidatExistant': 'OK',
        },
      ])
    cy.writeFile('tests/e2e/files/aurige.end.json',
      [
        {
          'codeNeph': Cypress.env('NEPH'),
          'nomNaissance': Cypress.env('candidat'),
          'email': Cypress.env('emailCandidat'),
          'dateReussiteETG': '',
          'nbEchecsPratiques': '',
          'dateDernierNonReussite': '',
          'objetDernierNonReussite': '',
          'reussitePratique': '',
          'candidatExistant': 'NOK',
        },
      ])
    // Creates the csv file
    cy.writeFile('tests/e2e/files/planning.csv', placesArray)
    // Archives the candidate if it's not already done
    cy.visit(Cypress.env('candilibAddress') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    cy.contains('import_export')
      .click()
    const filePath = '../files/aurige.end.json'
    const fileName = 'aurige.json'
    cy.fixture(filePath).then(fileContent => {
      cy.get('.input-file-container [type=file]')
        .upload({
          fileContent: JSON.stringify(fileContent),
          fileName,
          mimeType: 'application/json',
        })
    })
    cy.get('.v-snack')
      .should('contain', fileName + ' prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Le fichier ' + fileName + ' a été synchronisé.')
    // Adds the address to the whitelist
    cy.visit(Cypress.env('candilibAddress') + 'admin/whitelist')
    cy.get('h2')
      .should('contain', 'Liste blanche')
    cy.contains('Ajouter un lot d\'adresse courriel')
      .click()
    cy.get('#whitelist-batch-textarea')
      .type(Cypress.env('emailCandidat'))
    cy.contains('Enregistrer ces adresses')
      .click()
    // Adds the places from the created planning file
    cy.contains('calendar_today')
      .click()
    cy.get('.t-import-places [type=checkbox]')
      .check({ force: true })
    const filePath1 = '../files/planning.csv'
    const fileName1 = 'planning.csv'
    cy.fixture(filePath1).then(fileContent => {
      cy.get('[type=file]').upload({ fileContent, fileName: fileName1, mimeType: 'text/csv' })
    })
    cy.get('.v-snack')
      .should('contain', fileName1 + ' prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click({ force: true })
    cy.get('.v-snack', { timeout: 10000 })
      .should('contain', 'Le fichier ' + fileName1 + ' a été traité pour le departement 75.')
    cy.contains('exit_to_app')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes déconnecté·e')
    // The candidate fills the pre-sign-up form
    cy.visit(Cypress.env('candilibAddress') + 'qu-est-ce-que-candilib')
    cy.contains('Se pré-inscrire')
      .click()
    cy.get('h2')
      .should('contain', mesCandi.app_subtitle)
    cy.contains(mesCandi.preinscription_neph)
      .parent()
      .children('input')
      .type(Cypress.env('NEPH'))
    cy.contains(mesCandi.preinscription_nom_naissance)
      .parent()
      .children('input')
      .type(Cypress.env('candidat'))
    cy.contains(mesCandi.preinscription_prenom)
      .parent()
      .children('input')
      .type(Cypress.env('firstName'))
    cy.contains('Courriel *')
      .parent()
      .children('input')
      .type(Cypress.env('emailCandidat'))
    cy.contains(mesCandi.preinscription_mobile)
      .parent()
      .children('input')
      .type('0716253443')
    cy.contains(mesCandi.preinscription_adresse)
      .parent()
      .children('input')
      .type('avenue')
    cy.get('.v-select-list')
      .contains('avenue')
      .click()
    cy.contains(mesCandi.preinscription_bouton_submit)
      .click()
    // Verifies the access
    cy.url()
      .should('contain', 'email-validation')
    cy.get('h3')
      .should('contain', 'Validation en attente')
    cy.get('div')
      .should('contain', 'Vous allez bientôt recevoir un courriel à l\'adresse que vous nous avez indiqué.')
    // Validates the email address
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', Cypress.env('emailCandidat'))
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetSubject()
      .should('contain', 'Validation d\'adresse email pour Candilib')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetBody().then((mailBody) => {
        const codedLink = mailBody.split('href=3D"')[1].split('">')[0]
        const withoutEq = codedLink.replace(/=\r\n/g, '')
        const validationLink = withoutEq.replace(/=3D/g, '=')
        cy.visit(validationLink)
      })
    cy.get('h3')
      .should('contain', 'Adresse courriel validée')
    // Gets the confirmation email
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', Cypress.env('emailCandidat'))
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Inscription_Candilib_en_attente_de_v?= =?UTF-8?Q?=C3=A9rification?=')
    // The admin validates the candidate via Aurige
    cy.visit(Cypress.env('candilibAddress') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    cy.contains('import_export')
      .click()
    cy.get('.ag-overlay')
      .should('contain', 'No Rows To Show')
    const filePath2 = '../files/aurige.json'
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
    // Verifies that the candidate is validated
    cy.get('.ag-cell')
      .should('contain', Cypress.env('candidat'))
    cy.get('.ag-cell')
      .should('contain', 'Pour le 75, envoi d\'un magic link à ' + Cypress.env('emailCandidat'))
    cy.mhGetMailsByRecipient(Cypress.env('emailCandidat'))
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Validation_de_votre_inscription_=C3=A0_C?= =?UTF-8?Q?andilib?=')
    // Disconnects from the app
    cy.contains('exit_to_app')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes déconnecté·e')
    cy.url()
      .should('eq', Cypress.env('candilibAddress') + 'admin-login')
  })

  it('Checks', () => {
    cy.visit(Cypress.env('candilibAddress') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    // Checks the places on the dashboard
    cy.get('h2.title')
      .should('contain', Cypress.env('centre'))
      .contains(Cypress.env('centre'))
      .parents('.monitor-wrapper').within(($centre) => {
        cy.contains('21 oct. 2019')
          .parents('.th-ui-week-column')
          .should('have.class', 'red')
          .parents('tr')
          .find('button').first()
          .click()
      })
    // Verifies the planning
    cy.url()
      .should('contain', '2019-10-21')
    cy.get('.t-date-picker [type=text]').invoke('val')
      .should('contain', '21/10/2019')
    cy.get('.v-tabs__item--active')
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
          .type(Cypress.env('candidat'))
        cy.root().parents().contains(Cypress.env('candidat'))
          .click()
        cy.get('.place-details')
          .should('contain', Cypress.env('centre'))
        cy.contains('Valider')
          .click()
      })
    cy.get('.v-snack')
      .should('contain', Cypress.env('candidat'))
      .and('contain', 'a bien été affecté à la place')
      .contains('close').click()
    // Should be orange on the dashboard
    cy.get('.home-link')
      .click()
    cy.get('h2.title')
      .should('contain', Cypress.env('centre'))
      .contains(Cypress.env('centre'))
      .parents('.monitor-wrapper').within(($centre) => {
        cy.contains('21 oct. 2019')
          .parents('.th-ui-week-column')
          .should('have.class', 'orange')
          .parents('tr')
          .find('button').first()
          .click()
      })
    cy.url()
      .should('contain', '2019-10-21')
    cy.get('.t-date-picker [type=text]').invoke('val')
      .should('contain', '21/10/2019')
    cy.get('.v-tabs__item--active')
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
    cy.get('.v-snack')
      .should('contain', 'a bien été supprimée de la base')
      .contains('close').click()
    // Should be green on the dashboard
    cy.get('.home-link')
      .click()
    cy.get('h2.title')
      .should('contain', Cypress.env('centre'))
      .contains(Cypress.env('centre'))
      .parents('.monitor-wrapper').within(($centre) => {
        cy.contains('21 oct. 2019')
          .parents('.th-ui-week-column')
          .should('have.class', 'green')
          .parents('tr')
          .find('button').first()
          .click()
      })
    cy.url()
      .should('contain', '2019-10-21')
    cy.get('.t-date-picker [type=text]').invoke('val')
      .should('contain', '21/10/2019')
    cy.get('.v-tabs__item--active')
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
    cy.get('.v-snack')
      .should('contain', 'La réservation choisie a été annulée.')
  })
})
