// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import 'cypress-file-upload'
import 'cypress-mailhog'
import './mailHogCommands'

Cypress.Commands.add('adminLogin', () => {
  cy.visit(Cypress.env('frontAdmin') + 'admin-login')
  cy.get('.t-login-email [type=text]')
    .type(Cypress.env('adminLogin'))
  cy.get('[type=password]')
    .type(Cypress.env('adminPass'))
  cy.get('.submit-btn')
    .click()
  cy.get('.v-snack')
    .should('contain', 'Vous êtes identifié')
})

Cypress.Commands.add('adminDisconnection', () => {
  cy.get('.t-disconnect')
    .click()
  cy.get('.v-snack')
    .should('contain', 'Vous êtes déconnecté·e')
})

Cypress.Commands.add('archiveCandidate', () => {
  // Creates the aurige file
  cy.writeFile(Cypress.env('filePath') + '/aurige.end.json',
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
  // Archives the candidate
  cy.contains('import_export')
    .click()
  const filePath = '../../../' + Cypress.env('filePath') + '/aurige.end.json'
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
})

Cypress.Commands.add('addToWhitelist', () => {
  cy.contains('favorite')
    .click()
  cy.get('h2')
    .should('contain', 'Liste blanche')
  cy.contains('Ajouter un lot d\'adresse courriel')
    .click()
  cy.get('#whitelist-batch-textarea')
    .type(Cypress.env('emailCandidat'))
  cy.contains('Enregistrer ces adresses')
    .click()
  cy.get('.home-link')
    .click()
})

Cypress.Commands.add('addPlanning', () => {
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
  // Creates the csv file
  cy.writeFile(Cypress.env('filePath') + '/planning.csv', placesArray)
  // Adds the places from the created planning file
  cy.contains('calendar_today')
    .click()
  cy.get('.t-import-places [type=checkbox]')
    .check({ force: true })
  const filePath1 = '../../../' + Cypress.env('filePath') + '/planning.csv'
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
})

Cypress.Commands.add('candidatePreSignUp', () => {
  // The candidate fills the pre-sign-up form
  cy.visit(Cypress.env('frontCandidat') + 'qu-est-ce-que-candilib')
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
    // Checks the access
  cy.url()
    .should('contain', 'email-validation')
  cy.get('h3')
    .should('contain', 'Validation en attente')
  cy.get('div')
    .should('contain', 'Vous allez bientôt recevoir un courriel à l\'adresse que vous nous avez indiqué.')
    // Validates the email address
  cy.mhGetFirstRecipients()
    .should('contain', Cypress.env('emailCandidat'))
  cy.mhGetFirstSubject()
    .should('contain', 'Validation d\'adresse courriel pour Candilib')
  cy.mhGetFirstBody().then((mailBody) => {
    // TODO: decode properly the href
    const codedLink = mailBody.split('href=3D"')[1].split('">')[0]
    const withoutEq = codedLink.replace(/=\r\n/g, '')
    const validationLink = withoutEq.replace(/=3D/g, '=')
    cy.visit(validationLink)
  })
  cy.get('h3')
    .should('contain', 'Adresse courriel validée')
    // Gets the confirmation email
  cy.mhGetFirstRecipients()
    .should('contain', Cypress.env('emailCandidat'))
  cy.mhGetFirstSubject()
    .should('contain', '=?UTF-8?Q?Inscription_Candilib_en_attente_de_v?= =?UTF-8?Q?=C3=A9rification?=')
})

Cypress.Commands.add('candidateValidation', () => {
  cy.writeFile(Cypress.env('filePath') + '/aurige.json',
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
  cy.mhGetMailsByRecipient(Cypress.env('emailCandidat'))
    .mhFirst()
    .mhGetSubject()
    .should('contain', '=?UTF-8?Q?Validation_de_votre_inscription_=C3=A0_C?= =?UTF-8?Q?andilib?=')
})
