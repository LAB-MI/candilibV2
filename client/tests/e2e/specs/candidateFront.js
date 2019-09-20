/* Tests :
CONNECTED CANDIDATE FRONT
- Display of the FAQ
- Display of the 'Mentions Légales'
- Display of the profile
- Ability to add a reservation
- Ability to change the reservation
- Ability to resend confirmation mail
- Ability to cancel a reservation
- Confirmation email
- Cancellation email

PUBLIC CANDIDATE FRONT
- Display of the FAQ when not connected
- Display of the 'Mentions Légales' when not connected
- Ability to go back to the sign-up or introduction pages
*/

const csvHeaders = 'Date,Heure,Inspecteur,Non,Centre,Departement'
const horaires = [
  '07:30',
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
  '16:00',
]

const csvRowBuilder = (inspecteur, matricule) => horaire => `${Cypress.env('datePlace')},${horaire},${matricule},${inspecteur},${Cypress.env('centre')},75`

const placesInspecteur1 = horaires.map(csvRowBuilder(Cypress.env('inspecteur'), Cypress.env('matricule')))
const placesInspecteur2 = horaires.map(csvRowBuilder(Cypress.env('inspecteur2'), Cypress.env('matricule2')))

const placesArray = [csvHeaders].concat(placesInspecteur1).concat(placesInspecteur2).join('\n')

// Initialise magicLink
var magicLink

describe('Connected candidate front', () => {
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

  it('Tests the candidate front', () => {
    cy.visit(magicLink)
    // Tests the FAQ
    cy.contains('help_outline')
      .click()
    cy.url()
      .should('contain', 'faq')
    cy.get('h2')
      .should('contain', 'F.A.Q')
    cy.get('.question-content')
      .should('not.be.visible')
    cy.get('.question').contains('?')
      .click()
    cy.get('.question-content')
      .should('be.visible')
    // Tests the 'Mentions Légales' page
    cy.contains('account_balance')
      .click()
    cy.url()
      .should('contain', 'mentions-legales')
    cy.get('h2')
      .should('contain', 'Mentions légales')
    // Tests the profile page
    cy.contains('supervised_user_circle')
      .click()
    cy.url()
      .should('contain', 'mon-profil')
    cy.get('h2')
      .should('contain', 'Mon profil')
    cy.contains('Nom de naissance')
      .parent().parent()
      .should('contain', Cypress.env('candidat'))
    // Adds the reservation
    cy.contains('home')
      .click()
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
        cy.get('container')
          .should('not.contain', '07h30-08h00')
          .and('not.contain', '16h00-16h30')
          .and('not.contain', '12h30-13h00')
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
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', Cypress.env('emailCandidat'))
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Convocation_=C3=A0_l=27examen_pratique_d?= =?UTF-8?Q?u_permis_de_conduire?=')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetBody()
      .should('contain', Cypress.env('centre').toUpperCase())
      .and('contain', '8:00')
    cy.get('.v-dialog')
      .should('contain', 'Merci de noter Candilib')
      .find('button')
      .contains('Plus tard')
      .click({ timeout: 10000 })
    // Changes the reservation
    cy.contains('Modifier ma réservation')
      .click()
    cy.contains(Cypress.env('centre'))
      .click()
    cy.get('.v-tabs .primary--text')
      .click()
    cy.contains(' ' + Cypress.env('placeDate').split('-')[2] + ' ')
      .parents('.v-list__group')
      .within(($date) => {
        cy.root().click()
        cy.contains('08h30-09h00')
          .click()
      })
    cy.get('h2')
      .should('contain', 'Confirmer la modification')
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
      .should('contain', 'à 08:30')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', Cypress.env('emailCandidat'))
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Convocation_=C3=A0_l=27examen_pratique_d?= =?UTF-8?Q?u_permis_de_conduire?=')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetBody()
      .should('contain', Cypress.env('centre').toUpperCase())
      .and('contain', '8:30')
    cy.mhHasMailWithSubject('=?UTF-8?Q?Annulation_de_votre_convocation_=C3=A0_l?= =?UTF-8?Q?=27examen?=')
    cy.mhDeleteAll()
    // Resend the confirmation
    cy.contains('Renvoyer ma convocation')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Votre convocation a été envoyée dans votre boîte mail.')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', Cypress.env('emailCandidat'))
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Convocation_=C3=A0_l=27examen_pratique_d?= =?UTF-8?Q?u_permis_de_conduire?=')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetBody()
      .should('contain', Cypress.env('centre').toUpperCase())
      .and('contain', '8:30')
    // Cancels the reservation
    cy.contains('Annuler ma réservation')
      .click()
    cy.get('button')
      .contains('Confirmer')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Votre annulation a bien été prise en compte.')
    cy.get('h2')
      .should('contain', 'Choix du centre')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', Cypress.env('emailCandidat'))
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Annulation_de_votre_convocation_=C3=A0_l?= =?UTF-8?Q?=27examen?=')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetBody()
      .should('contain', Cypress.env('centre').toUpperCase())
      .and('contain', '8:30')
    // Disconnects
    cy.contains('exit_to_app')
      .click()
    cy.url()
      .should('contain', 'candidat-presignup')
  })
})

describe('Public candidate front', () => {
  it('Tests the FAQ and Mentions Légales', () => {
    cy.visit(Cypress.env('candilibAddress') + 'qu-est-ce-que-candilib')
    // Goes to the 'Mentions Légales' page
    cy.contains('Mentions Légales')
      .click()
    cy.url()
      .should('contain', 'mentions-legales')
    cy.get('h2')
      .should('contain', 'Mentions légales')
    cy.contains('exit_to_app')
      .click()
    cy.url()
      .should('contain', 'candidat-presignup')
    // Tests the display of the F.A.Q.
    cy.contains('Une question')
      .click()
    cy.url()
      .should('contain', 'faq')
    cy.get('h2')
      .should('contain', 'F.A.Q')
    cy.get('.question-content')
      .should('not.be.visible')
    cy.get('.question').contains('?')
      .click()
    cy.get('.question-content')
      .should('be.visible')
    cy.get('.home-link')
      .click()
    cy.url()
      .should('contain', 'qu-est-ce-que-candilib')
  })
})
