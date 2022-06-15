import {
  now, getNow,
} from '../support/dateUtils'
import { candidatBookPlace, candidatCantSelectPlace } from './util/util-cypress'

describe('Candidate by group', () => {
  const numberOfDaysBeforeDate = 7
  const arbitraryValue = 7
  let nowIn1Week = now.plus({ days: numberOfDaysBeforeDate + arbitraryValue })
  if (nowIn1Week.weekday === 7) nowIn1Week = nowIn1Week.plus({ days: 1 })
  const candidatsByDepartments = Array(6).fill(true).map((_, index) => ({
    codeNeph: `612345678901299${index + 1}`,
    prenom: 'CC_FRONT',
    nomNaissance: `CANDIDAT_GROUP${index + 1}`,
    adresse: '40 Avenue des terroirs de France 75012 Paris',
    portable: '0676543986',
    email: `test.candidat_group${index + 1}@candi.lib`,
    departement: '76',
    homeDepartement: '76',
    isEvaluationDone: true,
    isValidatedEmail: true,
    isValidatedByAurige: true,
    status: `${index}`,
    lastConnection: now,
    createdAt: nowIn1Week,
  }),
  )

  const candidatNoActive = {
    codeNeph: '61234567890129910',
    prenom: 'CC_FRONT',
    nomNaissance: 'CANDIDAT_GROUP10',
    adresse: '40 Avenue des terroirs de France 75012 Paris',
    portable: '0676543986',
    email: 'candidat_group10@candi.lib',
    departement: '76',
    homeDepartement: '76',
    isEvaluationDone: true,
    isValidatedEmail: true,
    isValidatedByAurige: true,
    status: '0',
    lastConnection: now.minus({ days: 61 }),
    createdAt: nowIn1Week,
  }

  before(() => {
    cy.deleteAllPlaces()
    cy.deleteAllMails()

    cy.adminLogin()
    cy.addPlanning([nowIn1Week], 'planning01.csv')
    cy.createRecentDepartement('76', '76@dept.com')

    cy.adminDisconnection()

    candidatsByDepartments.forEach(candidat => {
      cy.addCandidat(candidat)
    })
    cy.addCandidat(candidatNoActive)
  })

  after(() => {
    cy.deleteAllPlaces()
    candidatsByDepartments.forEach(candidat => {
      cy.deleteCandidat({ email: candidat.email })
    })
    cy.deleteCandidat({ email: candidatNoActive.email })
    cy.deleteDept({ _id: '76' })
    cy.updateCentres({ nom: Cypress.env('centre') }, { geoDepartement: '93' })
  })

  it('should get and book places for group1', () => {
    cy.updatePlaces({}, {
      createdAt: now.minus({ days: 2 }).toUTC(),
      visibleAt: getNow().toUTC(),
    }, true)
    cy.wait(1000)
    cy.getNewMagicLinkCandidat(candidatsByDepartments[0].email).then(mLink => {
      candidatBookPlace(mLink, candidatsByDepartments, nowIn1Week)
    })
  })

  it('should not get and not book places for group5', () => {
    cy.updatePlaces({}, {
      createdAt: now.minus({ days: 2 }).toUTC(),
      visibleAt: getNow().toUTC(),
    }, true)
    cy.wait(1000)
    cy.getNewMagicLinkCandidat(candidatsByDepartments[5].email).then(mLink => {
      candidatCantSelectPlace(mLink, candidatsByDepartments, nowIn1Week)
    })
  })

  it('should get and book places for group5 with is departement 76 is recent', () => {
    cy.updateCentres({ nom: Cypress.env('centre') }, { geoDepartement: '76' })

    cy.updatePlaces({}, {
      createdAt: now.minus({ days: 2 }).toUTC(),
      visibleAt: getNow().toUTC(),
    }, true)
    cy.wait(1000)
    cy.getNewMagicLinkCandidat(candidatsByDepartments[5].email).then(mLink => {
      candidatBookPlace(mLink, [candidatsByDepartments[5]], nowIn1Week, undefined, undefined, '76')
    })
  })

  describe('message inactive candidat', () => {
    const launchSortCandidats = () => {
      cy.adminLogin()
      cy.visit(`${Cypress.env('frontAdmin')}admin/aurige`)
      const btnContentStatus = 'Mettre à jour les statuts candilib'
      cy.get('button').should('contain', btnContentStatus)
        .contains(btnContentStatus).click()

      const btnContentOk = 'Confirmer'
      cy.get('.v-dialog--active').should('contain', 'Veuillez confirmer la mise à jour')
        .find('input').type(60)
      cy.get('.v-dialog--active')
        .find('button')
        .should('contain', btnContentOk)
        .contains(btnContentOk)
        .click()
      cy.get('.v-snack--active')
        .should('contain', 'Mise à jour des status éffectués')
      cy.adminDisconnection()
    }

    before(() => {
      cy.deleteAllMails()
      launchSortCandidats()
    })
    it('should have not message for candidat inactive', () => {
      cy.getMailConnectionCandidat(candidatsByDepartments[5].email).then(body => {
        expect(body).to.not.have.string('candidats inactifs')
      })
    })

    it('should have message for candidat inactive', () => {
      cy.getMailConnectionCandidat(candidatNoActive.email).then(body => {
        expect(body).to.have.string('candidats inactifs')
      })
    })
  })
})
