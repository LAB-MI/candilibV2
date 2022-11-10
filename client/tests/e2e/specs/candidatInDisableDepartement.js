
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

describe('Connected candidat in departement 75 with disableAt', () => {
  let magicLink

  before(() => {
    cy.deleteAllMails()

    cy.adminLogin()

    cy.visit(Cypress.env('frontAdmin') + 'admin/departements')
    const actionDisableDep = (dep) => {
      const disableAtBtn = `.t-btn-disable-at-${dep}`

      cy.get(disableAtBtn)
        .click()

      cy.get(`.t-btn-apply-disable-at-${dep}`).parent().parent().parent().within(() => {
        cy.get('[aria-label="Le mois précédent"]').click()
        cy.wait(500)
        cy.get('.v-date-picker-table > table > tbody > :nth-child(3) > :nth-child(1) > .v-btn > .v-btn__content').click()
        cy.get(`.t-btn-apply-disable-at-${dep}`).click()
      })
    }

    actionDisableDep(75)
    cy.checkAndCloseSnackBar('Le département 75')

    actionDisableDep(93)
    cy.checkAndCloseSnackBar('Le département 93')

    cy.candidatConnection('sanji.vinsmoke75@candi.lib')

    cy.getLastMail().its('Content.Body').then((mailBody) => {
      magicLink = parseMagicLinkFromMailBody(mailBody)
    })
  })

  after(() => {
    cy.updateDep({ _id: '75' }, { disableAt: null })
    cy.updateDep({ _id: '93' }, { disableAt: null })
  })

  it('Should display message in selection departement view for disableAt departement', () => {
    cy.connectByMagicLink(magicLink)

    cy.get('.t-info-disable-departement').contains('En raison du déploiement de RdvPermis dans votre département (75), l’application Candilib ne proposera plus de places d’examens après la date du ')
  })

  it('Should have departement 25 and not departement 01 in choix de departement', () => {
    cy.connectByMagicLink(magicLink)
    cy.get('h2').should('contain', 'Choix du département')
    cy.get('[role="list"]').should('not.contain', '93')
  })
})
