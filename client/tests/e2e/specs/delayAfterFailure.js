/* Tests :
- The delay before trying again after failure
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

describe('Test delay after failed attempt', () => {
  before(() => {
    // Delete all mails before start
    cy.mhDeleteAll()
    // Creates the aurige files
    cy.writeFile(Cypress.env('filePath') + '/aurige.json',
      [
        {
          'codeNeph': Cypress.env('NEPH'),
          'nomNaissance': Cypress.env('candidat'),
          'email': Cypress.env('emailCandidat'),
          'dateReussiteETG': '2018-10-12',
          'nbEchecsPratiques': '1',
          'dateDernierNonReussite': '2019-09-16',
          'objetDernierNonReussite': 'echec',
          'reussitePratique': '',
          'candidatExistant': 'OK',
        },
      ])
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
    // Creates the csv file
    cy.writeFile(Cypress.env('filePath') + '/planning.csv', placesArray)
    // Archives the candidate if it's not already done
    cy.visit(Cypress.env('frontAdmin') + 'admin-login')
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
    // Adds the address to the whitelist
    cy.visit(Cypress.env('frontAdmin') + 'admin/whitelist')
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
    cy.contains('exit_to_app')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes déconnecté·e')
  })

  it('Goes to the reservation page and can\'t add reservation', () => {
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
      .should('contain', 'Validation d\'adresse courriel pour Candilib')
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
    cy.visit(Cypress.env('frontAdmin') + 'admin-login')
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
      .should('eq', Cypress.env('frontAdmin') + 'admin-login')
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
      }).then(($link) => {
        cy.visit(magicLink)
      })
    // Tries to add the reservation
    cy.get('h2')
      .should('contain', 'Choix du centre')
    cy.contains(Cypress.env('centre'))
      .click()
    cy.get('.v-alert.warning')
      .should('contain', 'Vous avez échoué le lundi 16 septembre 2019 à l\'examen pratique du permis de conduire. Vous ne pouvez sélectionner une date qu\'à partir du jeudi 31 octobre 2019.')
    cy.get('.v-tabs')
      .should('not.have.class', 'primary--text')
    cy.clearLocalStorage()
    cy.reload(true)
    cy.url()
      .should('contain', 'candidat-presignup')
  })
})
