/* Tests :
- Candidate search and display of the name
*/

import {
  now,
} from '../support/dateUtils'
import {
  adminCancelBookedPlace,
  adminCheckCandidatHystoryActionsByType,
  candidatBookPlace,
  candidatCancelPlace,
  candidatModifyPlace,
} from './util/util-cypress'

describe('Search Candidate', () => {
  if (Cypress.env('VUE_APP_CLIENT_BUILD_INFO') !== 'COVID') {
    before(() => {
    // Delete all mails before start
      cy.deleteAllMails()
      cy.adminLogin()
      cy.archiveCandidate()
      cy.adminDisconnection()
      cy.candidatePreSignUp()
    })

    beforeEach(() => {
      cy.adminLogin()
      cy.visit(Cypress.env('frontAdmin') + 'admin/admin-candidat')
    })

    afterEach(() => {
      cy.adminDisconnection()
    })

    it('Searches for candidat', () => {
      cy.get('.t-search-candidat [type=text]').type(Cypress.env('candidat'))
      cy.contains(Cypress.env('candidat')).click()
      cy.get('h3').should('contain', 'nformations')
      cy.get('.t-result-candidat')
        .contains('Email')
        .parent()
        .should('contain', Cypress.env('emailCandidat'))
    })

    it('Search candidate by filter', () => {
      cy.get('.t-checkbox-one')
        .parent()
        .click()
      cy.get('.t-search-candidat [type=text]').type('DAT')
      cy.contains(Cypress.env('candidat')).click()
      cy.get('.t-checkbox-one')
        .parent()
        .click()
      cy.get('.t-checkbox-two')
        .parent()
        .click()
      cy.get('.t-search-candidat [type=text]').type('CAN')
      cy.contains(Cypress.env('candidat')).click()
      cy.get('.t-checkbox-two')
        .parent()
        .click()
    })
  } else {
    it('skip for message CODIV 19', () => { cy.log('skip for message CODIV 19') })
  }
})

describe('Candidate Profile', () => {
  if (Cypress.env('VUE_APP_CLIENT_BUILD_INFO') !== 'COVID') {
    let magicLink

    const numberOfDaysBeforeDate = 7
    const numberOfDaysPenalty = 45 // 45éme jours inclus et 46 eme jours reservable //TODO: A vérifier
    const nowIn1Week = now.plus({ days: numberOfDaysBeforeDate })
    const nowIn1WeekAnd1DaysBefore = now.plus({ days: (numberOfDaysBeforeDate - 1) })
    const bookedPlaceIn45Days = nowIn1WeekAnd1DaysBefore.plus({ days: numberOfDaysPenalty })
    const dayAfter46thDays = bookedPlaceIn45Days.plus({ days: 1 })
    const dayAfter45Days = dayAfter46thDays.plus({ days: 1 }).weekday > 6 ? dayAfter46thDays.plus({ days: 1 }) : dayAfter46thDays
    const dayBefore45Days = bookedPlaceIn45Days.minus({ days: (bookedPlaceIn45Days.weekday === 1 ? 2 : 1) })

    const candidatsByDepartments = [{
      codeNeph: '6123456789012',
      prenom: 'CC_FRONT',
      nomNaissance: 'CANDIDAT_FRONT_75',
      adresse: '40 Avenue des terroirs de France 75012 Paris',
      portable: '0676543986',
      email: 'candidat_front_75@candi.lib',
      departement: '75',
      isEvaluationDone: true,
      isValidatedEmail: true,
      isValidatedByAurige: true,
    },
    {
      codeNeph: '6123456789013',
      prenom: 'CC_FRONT',
      nomNaissance: 'CANDIDAT_FRONT_93',
      adresse: '40 Avenue des terroirs de France 75012 Paris',
      portable: '0676543986',
      email: 'candidat_front_93@candi.lib',
      departement: '93',
      isEvaluationDone: false,
      isValidatedEmail: true,
      isValidatedByAurige: true,
    }]

    beforeEach(() => {
      cy.deleteAllMails()
      cy.deleteAllPlaces()
      cy.adminLogin()
      cy.addPlanning([nowIn1Week, nowIn1WeekAnd1DaysBefore, dayAfter45Days, dayBefore45Days])
      cy.adminDisconnection()

      cy.updatePlaces({}, { createdAt: now.minus({ days: 2 }).toUTC() }, true)

      cy.addCandidat(candidatsByDepartments[0])
      cy.getNewMagicLinkCandidat(candidatsByDepartments[0].email).then(mLink => {
        magicLink = mLink
      })
    })

    afterEach(() => {
      candidatsByDepartments.forEach(candidat => {
        cy.deleteCandidat({ email: candidat.email })
      })
    })

    it('Verify candidat archived modification place', () => {
      const typeAction = 'Modification'
      candidatBookPlace(magicLink, candidatsByDepartments, nowIn1Week)
      candidatModifyPlace(magicLink, candidatsByDepartments, nowIn1Week)
      adminCheckCandidatHystoryActionsByType(candidatsByDepartments, typeAction)
    })

    it('Verify candidat archived annulation place', () => {
      const typeAction = 'Annulation'
      const makeBy = 'Le Candidat'
      candidatBookPlace(magicLink, candidatsByDepartments, nowIn1Week)
      candidatCancelPlace(magicLink, candidatsByDepartments)
      adminCheckCandidatHystoryActionsByType(candidatsByDepartments, typeAction, makeBy)
    })

    it('Verify candidat archived annulation place by admin', () => {
      const typeAction = 'Annulation admin'
      const makeBy = Cypress.env('adminLogin')
      candidatBookPlace(magicLink, candidatsByDepartments, nowIn1Week)
      adminCancelBookedPlace(nowIn1Week, nowIn1Week)
      adminCheckCandidatHystoryActionsByType(candidatsByDepartments, typeAction, makeBy)
    })
  } else {
    it('skip for message CODIV 19', () => { cy.log('skip for message CODIV 19') })
  }
})
