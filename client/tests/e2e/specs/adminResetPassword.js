/* Tests :
- Admin reset password
- Admin login with new Password
*/

import quotedPrintable from 'quoted-printable'
import { strongEnoughPasswordObject } from '../../../src/util/regex'

describe('Admin reset password', () => {
  const weakPassword = '123456788'
  const password = 'Am9@5medf2'
  const wrongConfirmation = '1234'
  let validationLink

  before(() => {
    cy.deleteAllMails()
    cy.visit(Cypress.env('frontAdmin') + 'admin-login')
    cy.get('.reset-password-btn')
      .click()
    cy.get('.t-reset-password-email [type=text]')
      .type(Cypress.env('admin75Login'))
    cy.get('.t-reset-link-btn')
      .click()

    cy.get('.v-snack--active')
      .should('contain', 'Un courriel vient de vous être envoyé à l\'adresse ' + (Cypress.env('admin75Login')))
      .contains('close')
      .click()

    cy.getLastMail().its('Content.Body').then(mailBody => {
      const boundary = mailBody.substr(0, mailBody.indexOf('\n'))
      const parts = mailBody.split(boundary)
      const htmlPart = parts[2]
      const encodedResetLink = htmlPart.substring(htmlPart.indexOf('<a href='), htmlPart.indexOf('</a>') + 4)

      const utf8 = require('utf8')
      const resetLink = utf8.decode(quotedPrintable.decode(encodedResetLink))
      validationLink = resetLink.replace(/<a href='([^']+)'>.*/, '$1')
    })
  })

  it('Test validates the email address', () => {
    cy.getLastMail().getRecipients()
      .should('contain', Cypress.env('admin75Login'))
    cy.getLastMail().getSubject()
      .should('contain', '=?UTF-8?Q?R=C3=A9initialisation_de_votre_mot_de_pa?= =?UTF-8?Q?sse?=')
  })

  it('Tests unmatched passwords', () => {
    cy.visit(validationLink)
    cy.get('.t-new-password [type=password]')
      .type(password)
    cy.get('.t-confirm-new-password [type=password]')
      .type(wrongConfirmation)
    cy.get('.submit-btn')
      .click()
    cy.getLastMail()
      .getBody()
      .then(mailBody => {
        const boundary = mailBody.substr(0, mailBody.indexOf('\n'))
        const parts = mailBody.split(boundary)
        const htmlPart = parts[2]
        const encodedResetLink = htmlPart.substring(
          htmlPart.indexOf('<a href='),
          htmlPart.indexOf('</a>') + 4,
        )

        const utf8 = require('utf8')
        const resetLink = utf8.decode(quotedPrintable.decode(encodedResetLink))
        validationLink = resetLink.replace(/<a href='([^']+)'>.*/, '$1')
        cy.visit(validationLink)
        cy.get('.t-new-password [type=password]').type(password)
        cy.get('.t-confirm-new-password [type=password]').type(
          wrongConfirmation,
        )
        cy.get('.submit-btn').click()
        cy.get('.v-messages__message').should(
          'contain',
          'Veuillez confirmer votre mot de passe',
        )
      })
  })

  it('Tests a weak password', () => {
    cy.visit(validationLink)
    cy.get('.t-new-password [type=password]')
      .type(weakPassword)
    cy.get('.t-confirm-new-password [type=password]')
      .type(weakPassword)
    cy.get('.submit-btn')
      .click()
    cy.get('.v-messages__message')
      .should('contain', 'Veuillez entrer un mot de passe fort')
  })

  it('Tests passwordChecker', () => {
    cy.visit(validationLink)
    const testingStrings = [
      '!',
      'A',
      'a',
      '1',
      '12345678',
    ]

    for (const element of testingStrings) {
      const checks = Object.entries(strongEnoughPasswordObject).map(
        el => {
          const key = el[0]
          const regex = el[1]
          return [key, regex.test(element)]
        },
      )
      const arr = checks.filter(el => {
        const regex = el[1]
        return regex
      })

      const text = arr[0][0]

      cy.contains(text)
        .should('be.visible')

      cy.get('.t-new-password [type=password]')
        .type(element)

      cy.contains(text)
        .should('not.be.visible')
    }
  })

  it('Successful password reset', () => {
    cy.visit(validationLink)
    cy.get('.t-new-password [type=password]')
      .type(password)
    cy.get('.t-confirm-new-password [type=password]')
      .type(password)
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack--active')
      .should('contain', 'Votre mot de passe a bien été modifié')

    cy.getLastMail().getRecipients()
      .should('contain', Cypress.env('admin75Login'))
    cy.getLastMail().getSubject()
      .should('contain', '=?UTF-8?Q?Votre_mot_de_passe_a_=C3=A9t=C3=A9_r?= =?UTF-8?Q?=C3=A9initialis=C3=A9?=')

    cy.visit(Cypress.env('frontAdmin') + 'admin-login')
    cy.get('.t-login-email [type=text]')
      .type(Cypress.env('admin75Login'))
    cy.get('[type=password]')
      .type(password)
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack--active')
      .should('contain', 'Vous êtes identifié')
  })
})
