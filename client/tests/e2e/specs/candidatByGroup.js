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
    email: `candidat_group${index + 1}@candi.lib`,
    departement: '76',
    homeDepartement: '76',
    isEvaluationDone: true,
    isValidatedEmail: true,
    isValidatedByAurige: true,
    status: `${index}`,
  }),
  )
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
    cy.updatePlaces({}, {
      createdAt: now.minus({ days: 2 }).toUTC(),
      visibleAt: getNow().toUTC(),
    }, true)
    cy.wait(1000) // because cache places
  })

  after(() => {
    cy.deleteAllPlaces()
    candidatsByDepartments.forEach(candidat => {
      cy.deleteCandidat({ email: candidat.email })
    })
    cy.deleteDept({ _id: '76' })
    cy.updateCentres({ nom: Cypress.env('centre') }, { geoDepartement: '93' })
  })

  it('should get and book places for group1', () => {
    cy.getNewMagicLinkCandidat(candidatsByDepartments[0].email).then(mLink => {
      candidatBookPlace(mLink, candidatsByDepartments, nowIn1Week)
    })
  })

  it('should not get and not book places for group5', () => {
    cy.getNewMagicLinkCandidat(candidatsByDepartments[5].email).then(mLink => {
      candidatCantSelectPlace(mLink, candidatsByDepartments, nowIn1Week)
    })
  })

  it('should get and book places for group5 with is departement 76 is recent', () => {
    cy.updateCentres({ nom: Cypress.env('centre') }, { geoDepartement: '76' })
    cy.wait(1000) // because cache places
    cy.getNewMagicLinkCandidat(candidatsByDepartments[5].email).then(mLink => {
      candidatBookPlace(mLink, [candidatsByDepartments[5]], nowIn1Week, undefined, undefined, '76')
    })
  })
})
