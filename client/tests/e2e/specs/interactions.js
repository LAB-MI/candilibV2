/* Tests :
- The candidate reservation is visible on the admin front
- The reservation made by the admin is visible on the candidate front
- The reservation cancelled by the candidate disappears on the admin front
- The reservation cancelled by the admin disappears on the candidate front
- The candidate receives a mail when the admin cancels his reservation
- The candidate can't see disabled time slots
*/

const csvHeaders = 'Date,Heure,Inspecteur,Non,Centre,Departement'
const horaires = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
]

const csvRowBuilder = (inspecteur, matricule) => horaire => `${Cypress.env('datePlace')},${horaire},${matricule},${inspecteur},${Cypress.env('centre')},75`

const placesInspecteur1 = horaires.map(csvRowBuilder(Cypress.env('inspecteur'), Cypress.env('matricule')))
const placesInspecteur2 = horaires.map(csvRowBuilder(Cypress.env('inspecteur2'), Cypress.env('matricule2')))

const placesArray = [csvHeaders].concat(placesInspecteur1).concat(placesInspecteur2).join('\n')

// Initialise magicLink
var magicLink

describe('Standard scenarios', () => {
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
      .should('contain', 'Réservez votre place d\'examen')
    cy.contains('NEPH')
      .parent()
      .children('input')
      .type(Cypress.env('NEPH'))
    cy.contains('Nom de naissance')
      .parent()
      .children('input')
      .type(Cypress.env('candidat'))
    cy.contains('Prénom')
      .parent()
      .children('input')
      .type(Cypress.env('firstName'))
    cy.contains('Courriel *')
      .parent()
      .children('input')
      .type(Cypress.env('emailCandidat'))
    cy.contains('Portable')
      .parent()
      .children('input')
      .type('0716253443')
    cy.contains('Adresse')
      .parent()
      .children('input')
      .type('avenue')
    cy.get('.v-select-list')
      .contains('avenue')
      .click()
    cy.contains('Pré-inscription')
      .click()
    // Verifies the access
    cy.url()
      .should('contain', 'email-validation')
    cy.get('h3')
      .should('contain', 'Validation en attente')
    cy.get('div')
      .should('contain', 'Vous allez bientôt recevoir un courriel à l\'adresse que vous nous avez indiqué.')
    // Tries to pre-sign-up again
    cy.contains('Retour au formulaire de pré-inscription')
      .click()
    cy.get('h2')
      .should('contain', 'Réservez votre place d\'examen')
    cy.contains('NEPH')
      .parent()
      .children('input')
      .type(Cypress.env('NEPH'))
    cy.contains('Nom de naissance')
      .parent()
      .children('input')
      .type(Cypress.env('candidat'))
    cy.contains('Prénom')
      .parent()
      .children('input')
      .type(Cypress.env('firstName'))
    cy.contains('Courriel *')
      .parent()
      .children('input')
      .type(Cypress.env('emailCandidat'))
    cy.contains('Portable')
      .parent()
      .children('input')
      .type('0716253443')
    cy.contains('Adresse')
      .parent()
      .children('input')
      .type('avenue')
    cy.get('.v-select-list')
      .contains('avenue')
      .click()
    cy.contains('Pré-inscription')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Cette adresse courriel est déjà enregistrée')
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
    // Tries to connect while awaiting Aurige validation
    cy.visit(Cypress.env('candilibAddress') + 'qu-est-ce-que-candilib')
    cy.get('.t-already-signed-up-button-top')
      .should('contain', 'Déjà Inscrit ?')
      .click()
    cy.get('.t-magic-link-input-top [type=text]')
      .type(Cypress.env('emailCandidat'))
    cy.get('.t-magic-link-button-top')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Utilisateur en attente de validation.')
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
    // The candidate requests a link
    cy.visit(Cypress.env('candilibAddress') + 'qu-est-ce-que-candilib')
    cy.get('.t-already-signed-up-button-top')
      .should('contain', 'Déjà Inscrit ?')
      .click()
    cy.get('.t-magic-link-input-top [type=text]')
      .type(Cypress.env('emailCandidat'))
    cy.get('.t-magic-link-button-top')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Un lien de connexion vous a été envoyé.')
    // The candidate gets the link
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', Cypress.env('emailCandidat'))
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Validation_de_votre_inscription_=C3=A0_C?= =?UTF-8?Q?andilib?=')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetBody().then((mailBody) => {
        const codedLink = mailBody.split('href=3D"')[1].split('">')[0]
        const withoutEq = codedLink.replace(/=\r\n/g, '')
        magicLink = withoutEq.replace(/=3D/g, '=')
      })
  })

  it('The candidate chooses a place and the admin cancels it', () => {
    cy.visit(magicLink)
    // Adds the reservation
    cy.get('h2')
      .should('contain', 'Choix du centre')
    cy.contains(Cypress.env('centre'))
      .click()
    cy.get('.v-tabs .primary--text')
      .click()
    cy.contains(' ' + Cypress.env('placeDate').split('-')[2] + ' ')
      .parents('.v-list__group')
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
    cy.get('.v-snack')
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
      .should('contain', Cypress.env('candidat'))
    // The admin connects
    cy.visit(Cypress.env('candilibAddress') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    // The admin find the reservation and cancels it
    cy.visit(Cypress.env('candilibAddress') + 'admin/gestion-planning/*/' + Cypress.env('placeDate'))
    cy.get('.v-tabs')
      .contains(Cypress.env('centre'))
      .click({ force: true })
    cy.get('.v-window-item').not('[style="display: none;"]')
      .should('have.length', 1)
      .and('contain', Cypress.env('inspecteur')) // To ensure retry-ability
      .within(($centre) => {
        cy.get('.place-button')
          .contains('face')
          .click()
        cy.get('.place-details')
          .should('contain', Cypress.env('candidat'))
        cy.contains('Annuler réservation')
          .click()
        cy.contains('Supprimer réservation')
          .click()
      })
    cy.get('.v-snack')
      .should('contain', 'La réservation choisie a été annulée.')
    // Add the place back
    cy.get('.v-window-item').not('[style="display: none;"]')
      .within(($centre) => {
        cy.get('.place-button')
          .contains('block')
          .click()
        cy.contains('Rendre le créneau disponible')
          .click()
      })
    cy.get('.v-snack')
      .should('contain', 'a bien été crée.')
    // The candidate doesn't have the reservation anymore
    cy.visit(magicLink)
    cy.get('h2')
      .should('contain', 'Choix du centre')
    // Check candidate profile
    cy.contains('supervised_user_circle')
      .click()
    cy.contains('Nom de naissance')
      .parent().parent()
      .should('contain', Cypress.env('candidat'))
  })

  it('The admin assigns a candidate and the candidate cancels it', () => {
    // Check the candidate
    cy.visit(magicLink)
    cy.get('h2')
      .should('contain', 'Choix du centre')
    cy.contains('supervised_user_circle')
      .click()
    cy.contains('Nom de naissance')
      .parent().parent()
      .should('contain', Cypress.env('candidat'))
    // The admin assigns the candidate to a place
    cy.visit(Cypress.env('candilibAddress') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    // Goes to planning
    cy.visit(Cypress.env('candilibAddress') + 'admin/gestion-planning/*/' + Cypress.env('placeDate'))
    cy.get('.v-tabs')
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
    // The candidate cancels the place
    cy.visit(magicLink)
    cy.get('h2')
      .should('contain', 'Ma réservation')
    cy.get('h3')
      .should('contain', Cypress.env('centre'))
    cy.get('p')
      .should('contain', 'à 08:00')
    cy.contains('Annuler ma réservation')
      .click()
    cy.get('button')
      .contains('Confirmer')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Votre annulation a bien été prise en compte.')
    cy.get('h2')
      .should('contain', 'Choix du centre')
    // The admin verifies that the reservation has been cancelled
    cy.visit(Cypress.env('candilibAddress') + 'admin/gestion-planning/*/' + Cypress.env('placeDate'))
    cy.get('.v-tabs')
      .contains(Cypress.env('centre'))
      .click({ force: true })
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
      .should('contain', 'Choix du centre')
    cy.contains(Cypress.env('centre'))
      .click()
    cy.get('.v-tabs .primary--text')
      .click()
    cy.contains(' ' + Cypress.env('placeDate').split('-')[2] + ' ')
      .parents('.v-list__group')
      .within(($date) => {
        cy.root().click()
        cy.should('contain', '08h00-08h30')
      })
    // The admin deletes the places
    cy.visit(Cypress.env('candilibAddress') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    cy.visit(Cypress.env('candilibAddress') + 'admin/gestion-planning/*/' + Cypress.env('placeDate'))
    cy.get('.v-tabs')
      .contains(Cypress.env('centre'))
      .click({ force: true })
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
    cy.get('.v-snack')
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
    cy.get('.v-snack')
      .should('contain', 'a bien été supprimée de la base')
    cy.contains('exit_to_app')
      .click()
    cy.visit(magicLink)
    // The 8:00 slot should not be there anymore
    cy.get('h2')
      .should('contain', 'Choix du centre')
    cy.contains(Cypress.env('centre'))
      .click()
    cy.get('.v-tabs .primary--text')
      .click()
    cy.contains(' ' + Cypress.env('placeDate').split('-')[2] + ' ')
      .parents('.v-list__group')
      .within(($date) => {
        cy.root().click()
        cy.should('not.contain', '08h00-08h30')
      })
    // Add the places back
    cy.visit(Cypress.env('candilibAddress') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    cy.visit(Cypress.env('candilibAddress') + 'admin/gestion-planning/*/' + Cypress.env('placeDate'))
    cy.get('.v-tabs')
      .contains(Cypress.env('centre'))
      .click({ force: true })
    cy.get('.v-window-item').not('[style="display: none;"]')
      .should('have.length', 1, { timeout: 10000 })
      .and('contain', Cypress.env('inspecteur')) // To ensure retry-ability
      .within(($centre) => {
        cy.get('.place-button')
          .contains('block')
          .click()
        cy.contains('Rendre le créneau disponible')
          .click()
      })
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
