
import { parseMagicLinkFromMailBody } from './util/util-cypress'

describe('Connected candidat in a departement with disableAt', () => {
  let magicLink

  before(() => {
    cy.deleteAllMails()

    cy.candidatConnection(Cypress.env('emailCandidatInDisableDepartement'))

    cy.getLastMail().its('Content.Body').then((mailBody) => {
      magicLink = parseMagicLinkFromMailBody(mailBody)
    })
  })

  it('Should display message in selection departement view for disableAt departement', () => {
    cy.connectByMagicLink(magicLink)

    cy.get('.t-info-disable-departement').contains('En raison du déploiement de RdvPermis dans votre département (94), l’application Candilib ne proposera plus de places d’examens après la date du 29/01/2022')
  })

  it('Should have departement 25 and not departement 01 in choix de departement', () => {
    cy.connectByMagicLink(magicLink)
    cy.get('h2').should('contain', 'Choix du département')
    cy.get('[role="list"]').should('not.contain', '01')
    cy.get('[role="list"]').should('contain', '25')
  })
})
