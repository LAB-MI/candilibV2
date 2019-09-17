/* Tests :
CANDIDATE LOGIN
- Pre-sign-up
- Pre-sign-up without a whitelisted address
- Pre-sign-up with an already used email
- Pre-sign-up with an invalid NEPH
- Pre-sign-up with an invalid email
- Pre-sign-up with an invalid mobile number
- Email validation
- Aurige validation
- Aurige refusal because of invalid informations & mail
- Aurige refusal because of expired ETG & mail
- Already signed up & magic link mail
- Already signed up while awaiting validation
- Already signed up with an unknown mail
- Candidate deconnection

ADMIN LOGIN
- Admin login
- Restricted admin login
- Admin login with incorrect password/email combination
- Admin login with invalid email
- Admin deconnection
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
          'nbEchecsPratiques': '3',
          'dateDernierNonReussite': '2017-06-18',
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
      ])
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
    // Adds the addresses to the whitelist
    cy.contains('favorite')
      .click()
    cy.get('h2')
      .should('contain', 'Liste blanche')
    cy.contains('Ajouter un lot d\'adresse courriel')
      .click()
    cy.get('#whitelist-batch-textarea')
      .type(Cypress.env('emailCandidat') + '\njimgoose@candilib.com')
    cy.contains('Enregistrer ces adresses')
      .click()
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
      }).then(($link) => {
        cy.visit(magicLink)
      })
    cy.get('h2')
      .should('contain', 'Choix du centre')
    cy.contains('exit_to_app')
      .click()
    cy.url()
      .should('contain', 'candidat-presignup')
  })

  it('Tries the already signed up form without account', () => {
    cy.visit(Cypress.env('candilibAddress') + 'qu-est-ce-que-candilib')
    cy.get('.t-already-signed-up-button-top')
      .should('contain', 'Déjà Inscrit ?')
      .click()
    cy.get('.t-magic-link-input-top [type=text]')
      .type('badtest@example.com')
    cy.get('.t-magic-link-button-top')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Utilisateur non reconnu')
  })

  it('Tries to pre-signup with a not whitelisted address', () => {
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
      .type('badtest@example.com')
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
      .should('contain', 'L\'adresse courriel renseignée (badtest@example.com) n\'est pas dans la liste des invités.')
  })

  it('Tries to pre-signup with a bad NEPH', () => {
    cy.visit(Cypress.env('candilibAddress') + 'qu-est-ce-que-candilib')
    cy.contains('Se pré-inscrire')
      .click()
    cy.get('h2')
      .should('contain', 'Réservez votre place d\'examen')
    cy.contains('NEPH')
      .parent()
      .children('input')
      .type('0000000')
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
      .type(Cypress.env('email'))
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
      .should('contain', 'Veuillez remplir le formulaire')
  })

  it('Tries to pre-signup with a bad email', () => {
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
      .type('test@@example.com')
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
      .should('contain', 'Veuillez remplir le formulaire')
  })

  it('Tries to pre-signup with a bad mobile number', () => {
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
      .type(Cypress.env('email'))
    cy.contains('Portable')
      .parent()
      .children('input')
      .type('0000000000')
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
      .should('contain', 'Veuillez remplir le formulaire')
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

  it('Refuses the validation for incorrect informations', () => {
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

describe('Admin login', () => {
  it('Tests the admin login and disconnection', () => {
    cy.visit(Cypress.env('candilibAddress') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    cy.get('h2')
      .should('contain', 'Tableau de bord')
    cy.get('h3')
      .should('contain', Cypress.env('adminLogin').split('@')[0])
    // Disconnects from the app
    cy.contains('exit_to_app')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes déconnecté·e')
    cy.url()
      .should('eq', Cypress.env('candilibAddress') + 'admin-login')
  })

  it('Logins with a restricted admin account', () => {
    cy.visit(Cypress.env('candilibAddress') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('admin93Login'))
    cy.get('[type=password]')
      .type(Cypress.env('admin93Pass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    cy.get('.hexagon-wrapper')
      .should('not.contain', '75')
      .and('contain', '93')
    cy.get('h3')
      .should('contain', 'admin93')
    cy.get('.title')
      .should('contain', 'Bobigny')
    cy.get('.v-toolbar')
      .should('not.contain', 'import_export')
    cy.contains('calendar_today').click()
    cy.get('.v-tabs__div')
      .should('contain', 'Bobigny')
  })

  it('Tries the admin login with an invalid password', () => {
    cy.visit(Cypress.env('candilibAddress') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass') + 'bad')
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Identifiants invalides')
  })

  it('Tries the admin login with an invalid email', () => {
    cy.visit(Cypress.env('candilibAddress') + 'admin-login')
    cy.get('[type=text]')
      .type('admin@example')
    cy.get('[type=password]')
      .type('password')
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Veuillez remplir le formulaire')
  })
})
