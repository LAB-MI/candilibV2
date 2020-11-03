/* Tests :
- Candidate search and display of the name
*/

import {
  now,
  getFrenchDateTimeFromIso,
} from '../support/dateUtils'

import {
  adminBookPlaceForCandidat,
  adminCancelBookedPlace,
  adminCheckCandidatHystoryActionsByType,
  candidatBookPlace,
  candidatCancelPlace,
  candidatModifyPlace,
  checkEmailValue,
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
        .contains('Email :')
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

    const adminGoToInfoCandidat = (nomNaissance, editEmail, emailToVerify = Cypress.env('emailCandidat')) => {
      cy.get('.t-search-candidat [type=text]').type(nomNaissance)
      cy.contains(nomNaissance).click()
      cy.get('h3').should('contain', 'nformations')

      checkEmailValue(emailToVerify)

      cy.get('.t-update-candidat-email-edit').click()
      cy.get('.t-update-candidat-email-write').within(updatetowrite => {
        cy.get('input').should('have.value', emailToVerify)
        editEmail && editEmail()
      })
    }

    it('Update candidat email with incorrect format', () => {
      adminGoToInfoCandidat(Cypress.env('candidat'), () => {
        cy.get('input').type('{selectall}{backspace}')
      })
      cy.get('.v-btn--contained').contains('Valider').parent().should('be.disabled')
      cy.get('button').contains('Retour').click()
      checkEmailValue()
    })

    it('Update candidat email with same email', () => {
      adminGoToInfoCandidat(Cypress.env('candidat'))

      cy.get('.v-btn--contained').contains('Valider').parent().should('not.be.disabled')
      cy.get('.v-btn--contained').contains('Valider').click()

      cy.get('.v-snack--active')
        .should('contain', 'La nouvelle adresse courriel est identique à ')
    })

    it('Update candidat email', () => {
      let emailToVerify
      for (const newEmail of ['test@test.com', Cypress.env('emailCandidat')]) {
        adminGoToInfoCandidat(Cypress.env('candidat'), () => {
          cy.get('input').type('{selectall}{backspace}')
          cy.get('input').type(newEmail)
        }, emailToVerify)
        cy.get('.v-btn--contained').contains('Valider').parent().should('not.be.disabled')
        cy.get('.v-btn--contained').contains('Valider').click()

        cy.get('.v-snack--active')
          .should('contain', 'a été changé.')
        checkEmailValue(newEmail)
        emailToVerify = newEmail
      }
    })
  } else {
    it('skip for message CODIV 19', () => { cy.log('skip for message CODIV 19') })
  }
})

describe('Candidate Profile', () => {
  if (Cypress.env('VUE_APP_CLIENT_BUILD_INFO') !== 'COVID') {
    let magicLink

    const numberOfDaysBeforeDate = 7
    const arbitraryValue = 7
    const nowIn1Week = now.plus({ days: numberOfDaysBeforeDate + arbitraryValue })

    const candidatsByDepartments = [
      {
        codeNeph: '612345678901299',
        prenom: 'CC_FRONT',
        nomNaissance: 'CANDIDAT_FRONT_LUFFY_75',
        adresse: '40 Avenue des terroirs de France 75012 Paris',
        portable: '0676543986',
        email: 'candidat_front_luffy_75@candi.lib',
        departement: '75',
        isEvaluationDone: true,
        isValidatedEmail: true,
        isValidatedByAurige: true,
      },
    ]

    beforeEach(() => {
      cy.deleteAllPlaces()
      cy.deleteAllMails()
      cy.adminLogin()
      cy.addPlanning([nowIn1Week], 'planning01.csv')
      cy.adminDisconnection()
      cy.updatePlaces({}, {
        createdAt: now.minus({ days: 2 }).toUTC(),
        visibleAt: now.minus({ days: 2 }).toUTC(),
      }, true)
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
      cy.adminLogin()
      adminCancelBookedPlace(nowIn1Week)
      adminCheckCandidatHystoryActionsByType(candidatsByDepartments, typeAction, makeBy)
      cy.get('tbody > tr > :nth-child(9)').should('contain', getFrenchDateTimeFromIso(now).split('à')[0])
      cy.get('tbody > tr > :nth-child(8)').should('contain', 'Le Candidat')
    })

    it('Verify candidat affect candidat place by admin', () => {
      const typeAction = 'Annulation admin'
      const makeBy = Cypress.env('adminLogin')
      adminBookPlaceForCandidat(nowIn1Week, candidatsByDepartments)
      adminCancelBookedPlace(nowIn1Week)
      adminCheckCandidatHystoryActionsByType(candidatsByDepartments, typeAction, makeBy)
      cy.get('tbody > tr > :nth-child(9)').should('contain', getFrenchDateTimeFromIso(now).split('à')[0])
      cy.get('tbody > tr > :nth-child(8)').should('contain', Cypress.env('adminLogin'))
    })
  } else {
    it('skip for message CODIV 19', () => { cy.log('skip for message CODIV 19') })
  }
})
