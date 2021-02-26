import { now } from '../support/dateUtils'

describe('Message ETG', () => {
  const emailCandidatEtgAFter3mois = 'candidat_etg_after_3_m@candi.lib'
  const emailCandidatEtgBefore3mois = 'candidat_etg_before_3_m@candi.lib'

  before(() => {
    // Delete all mails before start
    cy.deleteAllMails()

    cy.getCandidatInDB({ email: Cypress.env('emailCandidatFront') }).then(content => {
      const candidatAfter3m = JSON.parse(JSON.stringify(content[0]))
      candidatAfter3m._id = undefined
      candidatAfter3m.email = emailCandidatEtgAFter3mois
      candidatAfter3m.nomNaissance = 'CANDIDAT_AFTER_3_M'
      candidatAfter3m.token = undefined
      candidatAfter3m.dateReussiteETG = now.plus({ months: 4, years: -5 })

      cy.getCandidatInDB({ email: emailCandidatEtgAFter3mois }).then(candidat1 => {
        if (!candidat1.length) {
          cy.addCandidat(candidatAfter3m)
        }
      })

      const candidatBefore3m = JSON.parse(JSON.stringify(content[0]))
      candidatBefore3m._id = undefined
      candidatBefore3m.email = emailCandidatEtgBefore3mois
      candidatBefore3m.nomNaissance = 'CANDIDAT_BEFORE_3_M'
      candidatBefore3m.token = undefined
      candidatBefore3m.dateReussiteETG = now.plus({ months: 2, years: -5 })
      cy.getCandidatInDB({ email: emailCandidatEtgBefore3mois }).then(candidat2 => {
        if (!candidat2.length) {
          cy.addCandidat(candidatBefore3m)
        }
      })
    })
    cy.wait(500) // Créer les candidats dans la base avant de tester
  })

  after(() => {
    cy.deleteCandidat({ email: emailCandidatEtgAFter3mois })
    cy.deleteCandidat({ email: emailCandidatEtgBefore3mois })
  })
  it('Should not display message for the end ETG ', () => {
    cy.deleteAllMails()

    cy.getNewMagicLinkCandidat(emailCandidatEtgAFter3mois).then(mLink => {
      cy.visit(mLink)
      cy.wait(100)
      cy.visit(`${Cypress.env('frontCandidat')}candidat/${Cypress.env('geoDepartement')}/${Cypress.env('centre')}/undefinedMonth/undefinedDay/selection/selection-place`)
      cy.get('h2').should('contain', Cypress.env('centre'))

      cy.get('.v-alert').should('not.have.class', 't-warning-etg')
    })
  })

  it('Should display message for the end ETG ', () => {
    cy.deleteAllMails()

    cy.getNewMagicLinkCandidat(emailCandidatEtgBefore3mois).then(mLink => {
      cy.visit(mLink)
      cy.wait(100)
      cy.visit(`${Cypress.env('frontCandidat')}candidat/${Cypress.env('geoDepartement')}/${Cypress.env('centre')}/undefinedMonth/undefinedDay/selection/selection-place`)
      cy.get('h2').should('contain', Cypress.env('centre'))

      cy.get('.v-alert').should('have.class', 't-warning-etg')
    })
  })
})
