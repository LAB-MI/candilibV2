
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

    cy.get('.t-info-disable-departement').contains('En raison du déploiement de RdvPermis dans votre département (94), l’application Candilib ne proposera plus de places d’examens après la date du 30/01/2022')
  })
})
