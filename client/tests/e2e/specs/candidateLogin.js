/* Tests :
- Pre-sign-up
- Pre-sign-up with an already used email
- Pre-sign-up with an invalid NEPH
- Pre-sign-up with an invalid email
- Pre-sign-up with an invalid mobile number
- Email validation
- Aurige validation
- Already signed up & magic link mail
- Already signed up while awaiting validation
- Already signed up with an unknown mail
- Candidate deconnection
*/

describe('Candidate login', () => {
  if (Cypress.env('VUE_APP_CLIENT_BUILD_INFO') !== 'COVID') {
    // Initialise magicLink
    let magicLink

    before(() => {
    // Delete all mails before start
      cy.deleteAllMails()
      cy.adminLogin()
      cy.archiveCandidate()
      cy.adminDisconnection()
    })

    it('Create an account and verify line delay mail', () => {
    // The candidate fills the pre-sign-up form
      cy.visit(Cypress.env('frontCandidat') + 'candidat-presignup', {
        onBeforeLoad: (win) => {
          win.localStorage.clear()
        },
      })

      cy.get('.t-presignup-form').within(($inForm) => {
        cy.get('label').eq(0).should('contain', 'NEPH')
        cy.get('input').eq(0)
          .type(Cypress.env('NEPH'))
        cy.get('label').eq(1).should('contain', 'Nom de naissance')
        cy.get('input').eq(1)
          .type(Cypress.env('candidat'))
        cy.get('label').eq(2).should('contain', 'Prénom')
        cy.get('input').eq(2)
          .type(Cypress.env('firstName'))
        cy.get('label').eq(3).should('contain', 'Courriel')
        cy.get('input').eq(3)
          .type(Cypress.env('emailCandidat'))
        cy.get('label').eq(4).should('contain', 'Portable')
        cy.get('input').eq(4)
          .type('0716253443')
      })

      cy.get('.t-presignup-form .t-select-departements .v-input__slot').click()
      cy.get('.v-list-item')
        .contains(Cypress.env('departement'))
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
      // Tries to pre-sign-up again
      cy.contains('Retour au formulaire de pré-inscription')
        .click()
      cy.get('form').within(($inForm) => {
        cy.get('label').eq(0).should('contain', 'NEPH')
        cy.get('input').eq(0)
          .type(Cypress.env('NEPH'))
        cy.get('label').eq(1).should('contain', 'Nom de naissance')
        cy.get('input').eq(1)
          .type(Cypress.env('candidat'))
        cy.get('label').eq(2).should('contain', 'Prénom')
        cy.get('input').eq(2)
          .type(Cypress.env('firstName'))
        cy.get('label').eq(3).should('contain', 'Courriel')
        cy.get('input').eq(3)
          .type(Cypress.env('emailCandidat'))
        cy.get('label').eq(4).should('contain', 'Portable')
        cy.get('input').eq(4)
          .type('0716253443')
      })

      cy.get('.t-presignup-form .t-select-departements .v-input__slot').click()
      cy.get('.v-list-item')
        .contains(Cypress.env('departement'))
        .click()

      cy.contains('Pré-inscription')
        .click()
      cy.get('.v-snack--active')
        .should('contain', 'Cette adresse courriel est déjà enregistrée')
      // Validates the email address
      cy.getLastMail().getRecipients()
        .should('contain', Cypress.env('emailCandidat'))
      cy.getLastMail().getSubject()
        .should('contain', 'Validation d\'adresse courriel pour Candilib')
      cy.getLastMail().its('Content.Body').then((mailBody) => {
        const codedLink = mailBody.split('href=3D"')[1].split('">')[0]
        const withoutEq = codedLink.replace(/=\r\n/g, '')
        const validationLink = withoutEq.replace(/=3D/g, '=')
        cy.visit(validationLink)
      })
      cy.wait(100)
      cy.get('h3')
        .should('contain', 'Adresse courriel validée')
      // Gets the confirmation email
      cy.getLastMail().getRecipients()
        .should('contain', Cypress.env('emailCandidat'))
      cy.getLastMail().getSubject()
        .should('contain', '=?UTF-8?Q?Inscription_Candilib_en_attente_de_v?= =?UTF-8?Q?=C3=A9rification?=')
      // Tries to connect while awaiting Aurige validation
      cy.visit(Cypress.env('frontCandidat') + 'qu-est-ce-que-candilib')
      cy.get('.t-already-signed-up-button-top')
        .should('contain', 'Déjà Inscrit ?')
        .click()
      cy.get('.t-magic-link-input-top [type=text]')
        .type(Cypress.env('emailCandidat'))
      cy.get('.t-magic-link-button-top')
        .click()
      cy.get('.v-snack--active')
        .should('contain', 'Utilisateur en attente de validation.')
      // The admin validates the candidate via Aurige
      cy.adminLogin()
      cy.candidateValidation()
      cy.adminDisconnection()
      // The candidate requests a link
      cy.visit(Cypress.env('frontCandidat') + 'qu-est-ce-que-candilib')
      cy.get('.t-already-signed-up-button-top')
        .should('contain', 'Déjà Inscrit ?')
        .click()
      cy.get('.t-magic-link-input-top [type=text]')
        .type(Cypress.env('emailCandidat'))
      cy.get('.t-magic-link-button-top')
        .click()
      cy.get('.v-snack--active')
        .should('contain', 'Un lien de connexion vous a été envoyé.')
      // The candidate gets the link
      cy.getLastMail().getRecipients()
        .should('contain', Cypress.env('emailCandidat'))
      cy.getLastMail().getSubject()
        .should('contain', '=?UTF-8?Q?Validation_de_votre_inscription_=C3=A0_C?= =?UTF-8?Q?andilib?=')
    })

    it('Tries login with valide candidat', () => {
    // Changement d'utilisateur afin de récupérer un magicLink avec un candidat qui déjà passé la zone de quarantaine
      cy.visit(Cypress.env('frontCandidat') + 'qu-est-ce-que-candilib')
      cy.get('.t-already-signed-up-button-top')
        .should('contain', 'Déjà Inscrit ?')
        .click()
      cy.get('.t-magic-link-input-top [type=text]')
        .type(Cypress.env('emailCandidatFront'))
      cy.get('.t-magic-link-button-top')
        .click()
      cy.get('.v-snack--active')
        .should('contain', 'Un lien de connexion vous a été envoyé.')

      cy.getLastMail().its('Content.Body').then((mailBody) => {
        const codedLink = mailBody.split('href=3D"')[1].split('">')[0]
        const withoutEq = codedLink.replace(/=\r\n/g, '')
        magicLink = withoutEq.replace(/=3D/g, '=')
        cy.visit(magicLink)
      })
      cy.wait(100)
      cy.get('h2').eq(0)
        .should('contain', 'Choix du département')
      cy.get('.t-disconnect')
        .click()
    })

    it('Tries the already signed up form without account', () => {
      cy.visit(Cypress.env('frontCandidat') + 'qu-est-ce-que-candilib')
      cy.get('.t-already-signed-up-button-top')
        .should('contain', 'Déjà Inscrit ?')
        .click()
      cy.get('.t-magic-link-input-top [type=text]')
        .type('badtest@example.com')
      cy.get('.t-magic-link-button-top')
        .click()
      cy.get('.v-snack--active')
        .should('contain', 'Utilisateur non reconnu')
    })

    it('Tries to pre-signup with a bad NEPH', () => {
      cy.visit(Cypress.env('frontCandidat') + 'qu-est-ce-que-candilib')
      cy.contains('Se pré-inscrire')
        .click()
      cy.get('form').within(($inForm) => {
        cy.get('label').eq(0).should('contain', 'NEPH')
        cy.get('input').eq(0)
          .type('0000000')
        cy.get('label').eq(1).should('contain', 'Nom de naissance')
        cy.get('input').eq(1)
          .type(Cypress.env('candidat'))
        cy.get('label').eq(2).should('contain', 'Prénom')
        cy.get('input').eq(2)
          .type(Cypress.env('firstName'))
        cy.get('label').eq(3).should('contain', 'Courriel')
        cy.get('input').eq(3)
          .type(Cypress.env('emailCandidat'))
        cy.get('label').eq(4).should('contain', 'Portable')
        cy.get('input').eq(4)
          .type('0716253443')
      })

      cy.get('.t-presignup-form .t-select-departements .v-input__slot').click()
      cy.get('.v-list-item')
        .contains(Cypress.env('departement'))
        .click()

      cy.get('button').eq(1)
        .should('contain', 'Pré-inscription').click()

      cy.get('.v-snack--active')
        .should('contain', 'Veuillez remplir le formulaire')
    })

    it('Tries to pre-signup with a bad email', () => {
      cy.visit(Cypress.env('frontCandidat') + 'qu-est-ce-que-candilib')
      cy.contains('Se pré-inscrire')
        .click()
      cy.get('form').within(($inForm) => {
        cy.get('label').eq(0).should('contain', 'NEPH')
        cy.get('input').eq(0)
          .type(Cypress.env('NEPH'))
        cy.get('label').eq(1).should('contain', 'Nom de naissance')
        cy.get('input').eq(1)
          .type(Cypress.env('candidat'))
        cy.get('label').eq(2).should('contain', 'Prénom')
        cy.get('input').eq(2)
          .type(Cypress.env('firstName'))
        cy.get('label').eq(3).should('contain', 'Courriel')
        cy.get('input').eq(3)
          .type('test@@example.com')
        cy.get('label').eq(4).should('contain', 'Portable')
        cy.get('input').eq(4)
          .type('0716253443')
      })

      cy.get('.t-presignup-form .t-select-departements .v-input__slot').click()
      cy.get('.v-list-item')
        .contains(Cypress.env('departement'))
        .click()

      cy.get('button').eq(1)
        .should('contain', 'Pré-inscription').click()
      cy.get('.v-snack--active')
        .should('contain', 'Veuillez remplir le formulaire')
    })

    it('Tries to pre-signup with a bad mobile number', () => {
      cy.visit(Cypress.env('frontCandidat') + 'qu-est-ce-que-candilib')
      cy.contains('Se pré-inscrire')
        .click()
      cy.get('form').within(($inForm) => {
        cy.get('label').eq(0).should('contain', 'NEPH')
        cy.get('input').eq(0)
          .type(Cypress.env('NEPH'))
        cy.get('label').eq(1).should('contain', 'Nom de naissance')
        cy.get('input').eq(1)
          .type(Cypress.env('candidat'))
        cy.get('label').eq(2).should('contain', 'Prénom')
        cy.get('input').eq(2)
          .type(Cypress.env('firstName'))
        cy.get('label').eq(3).should('contain', 'Courriel')
        cy.get('input').eq(3)
          .type(Cypress.env('email'))
        cy.get('label').eq(4).should('contain', 'Portable')
        cy.get('input').eq(4)
          .type('0000000000')
      })

      cy.get('.t-presignup-form .t-select-departements .v-input__slot').click()
      cy.get('.v-list-item')
        .contains(Cypress.env('departement'))
        .click()

      cy.get('button').eq(1)
        .should('contain', 'Pré-inscription').click()
      cy.get('.v-snack--active')
        .should('contain', 'Veuillez remplir le formulaire')
    })
  } else {
    it('skip for message CODIV 19', () => { cy.log('skip for message CODIV 19') })
  }
})
