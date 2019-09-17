/* Tests :
CANDIDATE LOGIN
- Aurige validation
- Aurige refusal because of invalid informations & mail
- Aurige refusal because of expired ETG & mail
- Aurige refusal because of missing ETG & mail
- Aurige refusal because of 5 failed attempts & mail
*/

// Initialise magicLink
var magicLink

describe('Candidate login', () => {
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
        {
          'codeNeph': '093621795384',
          'nomNaissance': 'GOOSE',
          'prenom': 'JIM',
          'email': 'jimgoose@candilib.com',
          'dateReussiteETG': '2012-11-11',
          'nbEchecsPratiques': '0',
          'dateDernierNonReussite': '',
          'objetDernierNonReussite': '',
          'reussitePratique': '',
          'candidatExistant': 'OK',
        },
        {
          'codeNeph': '093571369217',
          'nomNaissance': 'CUTTER',
          'prenom': 'TOE',
          'email': 'toecutter@candilib.com',
          'dateReussiteETG': '2018-10-12',
          'nbEchecsPratiques': '',
          'dateDernierNonReussite': '',
          'objetDernierNonReussite': '',
          'reussitePratique': '',
          'candidatExistant': 'NOK Nom',
        },
        {
          'codeNeph': '093365721896',
          'nomNaissance': 'BOY',
          'prenom': 'JOHNNY',
          'email': 'johnnyboy@candilib.com',
          'dateReussiteETG': '',
          'nbEchecsPratiques': '',
          'dateDernierNonReussite': '',
          'objetDernierNonReussite': '',
          'reussitePratique': '',
          'candidatExistant': 'OK',
        },
        {
          'codeNeph': '093123456789',
          'nomNaissance': 'MAD',
          'prenom': 'MAX',
          'email': 'madmax@candilib.com',
          'dateReussiteETG': '2018-10-12',
          'nbEchecsPratiques': '1',
          'dateDernierNonReussite': '2019-09-16',
          'objetDernierNonReussite': 'echec',
          'reussitePratique': '',
          'candidatExistant': 'OK',
        },
        {
          'codeNeph': '097123456789',
          'nomNaissance': 'KING',
          'prenom': 'BB',
          'email': 'bbking@candilib.com',
          'dateReussiteETG': '2018-10-12',
          'nbEchecsPratiques': '5',
          'dateDernierNonReussite': '2019-01-01',
          'objetDernierNonReussite': 'echec',
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
        {
          'codeNeph': '093123456789',
          'nomNaissance': 'MAD',
          'prenom': 'MAX',
          'email': 'madmax@candilib.com',
          'dateReussiteETG': '',
          'nbEchecsPratiques': '',
          'dateDernierNonReussite': '',
          'objetDernierNonReussite': '',
          'reussitePratique': '',
          'candidatExistant': 'NOK',
        },
      ])
    // Archives the candidates if it's not already done
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
    // Adds the addresses to the whitelist
    cy.contains('favorite')
      .click()
    cy.get('h2')
      .should('contain', 'Liste blanche')
    cy.contains('Ajouter un lot d\'adresse courriel')
      .click()
    cy.get('#whitelist-batch-textarea')
      .type(Cypress.env('emailCandidat') + '\njimgoose@candilib.com\ntoecutter@candilib.com\nbbking@candilib.com\njohnnyboy@candilib.com')
    cy.contains('Enregistrer ces adresses')
      .click()
    cy.contains('exit_to_app')
      .click()
  })

  it('Validates the candidate via Aurige', () => {
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
      }).then(($link) => {
        cy.visit(magicLink)
      })
    cy.get('h2')
      .should('contain', 'Choix du centre')
    cy.contains('exit_to_app')
      .click()
  })

  it('Refuses the validation for missing ETG', () => {
    cy.visit(Cypress.env('candilibAddress') + 'qu-est-ce-que-candilib')
    cy.contains('Se pré-inscrire')
      .click()
    cy.get('h2')
      .should('contain', 'Réservez votre place d\'examen')
    cy.contains('NEPH')
      .parent()
      .children('input')
      .type('093365721896')
    cy.contains('Nom de naissance')
      .parent()
      .children('input')
      .type('BOY')
    cy.contains('Prénom')
      .parent()
      .children('input')
      .type('JOHNNY')
    cy.contains('Courriel *')
      .parent()
      .children('input')
      .type('johnnyboy@candilib.com')
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
    cy.contains('Retour au formulaire de pré-inscription')
      .click()
    // Gets the confirmation email from mailHog
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', 'johnnyboy@candilib.com')
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
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', 'johnnyboy@candilib.com')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Inscription_Candilib_en_attente_de_v?= =?UTF-8?Q?=C3=A9rification?=')
    // Aurige invalidate the user
    cy.visit(Cypress.env('candilibAddress') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    // Goes to the page
    cy.contains('import_export')
      .click()
    // Uploads the JSON file
    const filePath = '../files/aurige.json'
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
      .should('contain', 'aurige.json prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Le fichier aurige.json a été synchronisé.')
    // Verifies the error message
    cy.get('.ag-cell')
      .should('contain', 'Pour le 75, ce candidat johnnyboy@candilib.com sera archivé : dateReussiteETG invalide')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', 'johnnyboy@candilib.com')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Probl=C3=A8me_inscription_Candilib?=')
  })

  it('Refuses the validation for outdated ETG', () => {
    cy.visit(Cypress.env('candilibAddress') + 'qu-est-ce-que-candilib')
    cy.contains('Se pré-inscrire')
      .click()
    cy.get('h2')
      .should('contain', 'Réservez votre place d\'examen')
    cy.contains('NEPH')
      .parent()
      .children('input')
      .type('093621795384')
    cy.contains('Nom de naissance')
      .parent()
      .children('input')
      .type('GOOSE')
    cy.contains('Prénom')
      .parent()
      .children('input')
      .type('JIM')
    cy.contains('Courriel *')
      .parent()
      .children('input')
      .type('jimgoose@candilib.com')
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
    cy.contains('Retour au formulaire de pré-inscription')
      .click()
    // Gets the confirmation email from mailHog
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', 'jimgoose@candilib.com')
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
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', 'jimgoose@candilib.com')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Inscription_Candilib_en_attente_de_v?= =?UTF-8?Q?=C3=A9rification?=')
    // Aurige invalidate the user
    cy.visit(Cypress.env('candilibAddress') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    // Goes to the page
    cy.contains('import_export')
      .click()
    // Uploads the JSON file
    const filePath = '../files/aurige.json'
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
      .should('contain', 'aurige.json prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Le fichier aurige.json a été synchronisé.')
    // Verifies the error message
    cy.get('.ag-cell')
      .should('contain', 'Pour le 75, ce candidat jimgoose@candilib.com sera archivé : Date ETG KO')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', 'jimgoose@candilib.com')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Probl=C3=A8me_inscription_Candilib?=')
  })

  it('Refuses the validation for 5 failures', () => {
    cy.visit(Cypress.env('candilibAddress') + 'qu-est-ce-que-candilib')
    cy.contains('Se pré-inscrire')
      .click()
    cy.get('h2')
      .should('contain', 'Réservez votre place d\'examen')
    cy.contains('NEPH')
      .parent()
      .children('input')
      .type('097123456789')
    cy.contains('Nom de naissance')
      .parent()
      .children('input')
      .type('KING')
    cy.contains('Prénom')
      .parent()
      .children('input')
      .type('BB')
    cy.contains('Courriel *')
      .parent()
      .children('input')
      .type('bbking@candilib.com')
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
    cy.contains('Retour au formulaire de pré-inscription')
      .click()
    // Gets the confirmation email from mailHog
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', 'bbking@candilib.com')
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
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', 'bbking@candilib.com')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Inscription_Candilib_en_attente_de_v?= =?UTF-8?Q?=C3=A9rification?=')
    // Aurige invalidate the user
    cy.visit(Cypress.env('candilibAddress') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    // Goes to the page
    cy.contains('import_export')
      .click()
    // Uploads the JSON file
    const filePath = '../files/aurige.json'
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
      .should('contain', 'aurige.json prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Le fichier aurige.json a été synchronisé.')
    // Verifies the error message
    cy.get('.ag-cell')
      .should('contain', 'Pour le 75, ce candidat bbking@candilib.com sera archivé : A 5 échecs pratiques')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', 'bbking@candilib.com')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Probl=C3=A8me_inscription_Candilib?=')
  })

  it('Refuses the validation for invalid name', () => {
    cy.visit(Cypress.env('candilibAddress') + 'qu-est-ce-que-candilib')
    cy.contains('Se pré-inscrire')
      .click()
    cy.get('h2')
      .should('contain', 'Réservez votre place d\'examen')
    cy.contains('NEPH')
      .parent()
      .children('input')
      .type('093571369217')
    cy.contains('Nom de naissance')
      .parent()
      .children('input')
      .type('CUTTER')
    cy.contains('Prénom')
      .parent()
      .children('input')
      .type('TOE')
    cy.contains('Courriel *')
      .parent()
      .children('input')
      .type('toecutter@candilib.com')
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
    cy.contains('Retour au formulaire de pré-inscription')
      .click()
    // Gets the confirmation email from mailHog
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', 'toecutter@candilib.com')
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
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', 'toecutter@candilib.com')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Inscription_Candilib_en_attente_de_v?= =?UTF-8?Q?=C3=A9rification?=')
    // Aurige invalidate the user
    cy.visit(Cypress.env('candilibAddress') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    // Goes to the page
    cy.contains('import_export')
      .click()
    // Uploads the JSON file
    const filePath = '../files/aurige.json'
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
      .should('contain', 'aurige.json prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Le fichier aurige.json a été synchronisé.')
    // Verifies the error message
    cy.get('.ag-cell')
      .should('contain', 'Pour le 75, ce candidat 093571369217/CUTTER sera archivé : Nom inconnu')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', 'toecutter@candilib.com')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Inscription_Candilib_non_valid=C3=A9e?=')
  })

  it('Refuses the validation for invalid NEPH', () => {
    cy.visit(Cypress.env('candilibAddress') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    // Goes to the page
    cy.contains('import_export')
      .click()
    // Uploads the JSON file
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
      .should('contain', 'aurige.json prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Le fichier aurige.json a été synchronisé.')
    // Verifies the error message
    cy.get('.ag-cell')
      .should('contain', Cypress.env('candidat') + ' sera archivé : NEPH inconnu')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', Cypress.env('emailCandidat'))
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Inscription_Candilib_non_valid=C3=A9e?=')
  })
})
