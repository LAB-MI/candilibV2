/* Tests :
- Admin reset password
- Admin login with new Password
*/

const weakPassword = '123456788'
const password = 'Am9@5medf'
const wrongConfirmation = '1234'
let validationLink

describe('Admin login', () => {
  before(() => {
    it('Tests a request new password', () => {
      cy.visit(Cypress.env('frontAdmin') + 'admin-login')
      cy.get('.t-reset')
        .click()
      cy.get('.t-input')
        .type(Cypress.env('admin93Login'))
      cy.get('.submit-btn')
        .click()
      cy.get('.v-snack')
        .should('contain', `Un email vient de vous être envoyé à l'adresse` + (Cypress.env('admin93Login')))
    })

    it('Test validates the email address', () => {
      cy.mhGetAllMails()
        .mhFirst()
        .mhGetRecipients()
        .should('contain', Cypress.env('admin93Login'))
      cy.mhGetAllMails()
        .mhFirst()
        .mhGetSubject()
        .should('contain', '=?UTF-8?Q?R=C3=A9initialisation_de_votre_mot_de_pa?==?UTF-8?Q?sse?=')
      cy.mhGetAllMails()
        .mhFirst()
        .mhGetBody().then((mailBody) => {
          const codedLink = mailBody.split('href=3D"')[1].split('">')[0]
          const withoutEq = codedLink.replace(/=\r\n/g, '')
          validationLink = withoutEq.replace(/=3D/g, '=')
        })
    })
  })

  it('Tests unmatched passwords', () => {
    cy.visit(validationLink)
    cy.get('.t-new-password [type=password]')
      .type(password)
    cy.get('.t-confirm-new-password [type=password]')
      .type(wrongConfirmation)
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vos mots de passe ne correspondent pas')
  })

  it('Tests a weak password', () => {
    cy.visit(validationLink)
    cy.get('.t-new-password [type=password]')
      .type(weakPassword)
    cy.get('.t-confirm-new-password [type=password]')
      .type(weakPassword)
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Votre mot de passe a bien été modifié')
  })

  it('Tests a weak password', () => {
    cy.visit(validationLink)
    cy.get('.t-new-password [type=password]')
      .type(password)
    cy.get('.t-confirm-new-password [type=password]')
      .type(password)
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Votre mot de passe a bien été modifié')
  })

  it('Test validates the email address', () => {
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', Cypress.env('admin93Login'))
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Votre_mot_de_passe_a_=C3=A9t=C3=A9_r?==?UTF-8?Q?=C3=A9initialis=C3=A9?=')
  })
  it('Test connexion with new password')
  cy.visit(Cypress.env('frontAdmin') + 'admin-login')
  cy.get('[type=text]')
    .type(Cypress.env('admin93Login'))
  cy.get('[type=password]')
    .type(password)
  cy.get('.submit-btn')
    .click()
  cy.get('.v-snack')
    .should('contain', 'Vous êtes identifié')
})
