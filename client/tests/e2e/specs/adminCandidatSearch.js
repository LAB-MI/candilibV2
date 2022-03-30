/* Tests :
- Candidate search and display of the name
*/

import {
  now,
  getFrenchDateTimeFromIso,
  getFrenchDateFromLuxon,
  getFrenchDateTimeFromLuxon,
  getNow,
} from '../support/dateUtils'

import {
  adminBookPlaceForCandidat,
  adminCancelBookedPlace,
  adminCheckCandidatHystoryActionsByType,
  adminLaunchSearchCandidat,
  candidatBookPlace,
  candidatCancelPlace,
  candidatModifyPlace,
  checkEmailValue,
  checkPhoneNumberValue,
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

    it('Search candidate by filter "finit par"', () => {
      cy.get('.t-checkbox-one')
        .click()
      cy.get('.t-search-candidat [type=text]').type('DAT')
      cy.contains(Cypress.env('candidat')).click()
    })

    it('Search candidate by filter "commence par"', () => {
      cy.get('.t-checkbox-two')
        .click()
      cy.get('.t-search-candidat [type=text]').type('CAN')
      cy.contains(Cypress.env('candidat')).click()
    })

    const adminGoToInfoCandidat = (nomNaissance, emailToVerify = Cypress.env('emailCandidat')) => {
      cy.get('.t-search-candidat [type=text]').type(nomNaissance)
      cy.contains(nomNaissance).click()
      cy.get('h3').should('contain', 'nformations')

      checkEmailValue(emailToVerify)
    }

    const adminGoToInfoCandidatAndUpdateEmail = (nomNaissance, editEmail, emailToVerify = Cypress.env('emailCandidat')) => {
      adminGoToInfoCandidat(nomNaissance, emailToVerify)
      cy.get('.t-update-candidat-email-edit').click()
      cy.get('.t-update-candidat-email-write').within(updatetowrite => {
        cy.get('input').should('have.value', emailToVerify)
        editEmail && editEmail()
      })
    }

    it('Update candidat email with incorrect format', () => {
      adminGoToInfoCandidatAndUpdateEmail(Cypress.env('candidat'), () => {
        cy.get('input').type('{selectall}{backspace}')
      })
      cy.get('.t-btn-ok').contains('Valider').parent().should('be.disabled')
      cy.get('button').contains('Annuler').click()
      checkEmailValue()
    })

    it('Update candidat email with same email', () => {
      adminGoToInfoCandidatAndUpdateEmail(Cypress.env('candidat'))

      cy.get('.t-btn-ok').contains('Valider').parent().should('not.be.disabled')
      cy.get('.t-btn-ok').contains('Valider').click()

      cy.get('.v-snack--active')
        .should('contain', 'La nouvelle adresse courriel est identique à ')
    })

    it('Update candidat email', () => {
      let emailToVerify
      for (const newEmail of ['test@test.com', Cypress.env('emailCandidat')]) {
        adminGoToInfoCandidatAndUpdateEmail(Cypress.env('candidat'), () => {
          cy.get('input').type('{selectall}{backspace}')
          cy.get('input').type(newEmail)
        }, emailToVerify)
        cy.get('.t-btn-ok').contains('Valider').parent().should('not.be.disabled')
        cy.get('.t-btn-ok').contains('Valider').click()

        cy.get('.v-snack--active')
          .should('contain', 'a été changé.')
        checkEmailValue(newEmail)
        emailToVerify = newEmail
      }
    })

    const adminGoToInfoCandidatPhoneNumber = (nomNaissance, phoneNumberToVerify = Cypress.env('phoneNumberCandidat')) => {
      cy.get('.t-search-candidat [type=text]').type(nomNaissance)
      cy.contains(nomNaissance).click()
      cy.get('h3').should('contain', 'nformations')

      checkPhoneNumberValue(phoneNumberToVerify)
    }

    const adminGoToInfoCandidatAndUpdatePhoneNumber = (nomNaissance, editPhoneNumber, phoneNumberToVerify = Cypress.env('phoneNumberCandidat')) => {
      adminGoToInfoCandidatPhoneNumber(nomNaissance, phoneNumberToVerify)
      cy.get('.t-update-candidat-phone-number-edit').click()
      cy.get('.t-update-candidat-phone-number-write').within(updatetowrite => {
        cy.get('input').should('have.value', phoneNumberToVerify)
        editPhoneNumber && editPhoneNumber()
      })
    }

    it('Update candidat PhoneNumber with incorrect format', () => {
      adminGoToInfoCandidatAndUpdatePhoneNumber(Cypress.env('candidat'), () => {
        cy.get('input').type('{selectall}{backspace}')
        cy.get('input').type('060708')
      })
      cy.get('.t-btn-ok').contains('Valider').parent().should('be.disabled')
      cy.get('button').contains('Annuler').click()
      checkPhoneNumberValue(Cypress.env('phoneNumberCandidat'))
    })

    it('Update candidat PhoneNumber with same PhoneNumber', () => {
      adminGoToInfoCandidatAndUpdatePhoneNumber(Cypress.env('candidat'), () => {
        cy.get('input').type('{selectall}{backspace}')
        cy.get('input').type(Cypress.env('phoneNumberCandidat'))
      })

      cy.get('.t-btn-ok').contains('Valider').parent().should('not.be.disabled')
      cy.get('.t-btn-ok').contains('Valider').click()

      cy.get('.v-snack--active')
        .should('contain', 'Pas de modification pour le candidat')
    })

    it('Update candidat PhoneNumber', () => {
      let PhoneNumberToVerify
      for (const newPhoneNumber of ['0742424242', Cypress.env('phoneNumberCandidat')]) {
        adminGoToInfoCandidatAndUpdatePhoneNumber(Cypress.env('candidat'), () => {
          cy.get('input').type('{selectall}{backspace}')
          cy.get('input').type(newPhoneNumber)
        }, PhoneNumberToVerify || '0716253443')
        cy.get('.t-btn-ok').contains('Valider').parent().should('not.be.disabled')
        cy.get('.t-btn-ok').contains('Valider').click()

        cy.get('.v-snack--active')
          .should('contain', 'a été changé.')
        checkPhoneNumberValue(newPhoneNumber)
        PhoneNumberToVerify = newPhoneNumber
      }
    })

    const adminGoToInfoCandidatAndUpdateHomeDepartement = (nomNaissance, homeDepartement) => {
      cy.get('.t-search-candidat [type=text]').type(nomNaissance)
      cy.contains(nomNaissance).click()
      cy.get('h3').should('contain', 'nformations')

      cy.get('.t-update-candidat-home-departement-edit').click()
      cy.get('.t-select-departements-to-edit .v-input__slot').click()
      cy.get('.v-list-item')
        .contains(homeDepartement)
        .click()

      cy.get('.t-btn-ok').contains('Valider').click()
      cy.get('.t-home-departement-value').should('contain', homeDepartement)
    }
    it('Update candidat homeDepartement', () => {
      adminGoToInfoCandidatAndUpdateHomeDepartement(Cypress.env('candidat'), '93')
      adminGoToInfoCandidatAndUpdateHomeDepartement(Cypress.env('candidat'), '75')
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
    let nowIn1Week = now.plus({ days: numberOfDaysBeforeDate + arbitraryValue })
    if (nowIn1Week.weekday === 7) nowIn1Week = nowIn1Week.plus({ days: 1 })
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
        status: 0,
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

    it.skip('Verify candidat archived modification place', () => {
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

    it('Verify candidat last connection is now', () => {
      const DateStr = getFrenchDateFromLuxon(now)
      cy.visit(magicLink)
      adminLaunchSearchCandidat(candidatsByDepartments)
      cy.get('.label').should('contain', 'Date de la dernière connexion')
      cy.get('.label')
        .contains('Date de la dernière connexion')
        .parent()
        .should('contain', DateStr)
    })

    it('Should not have penalty for candidat', () => {
      adminLaunchSearchCandidat(candidatsByDepartments)
      const lineCanBookFrom = cy.get('.t-result-candidat').contains('Réservation possible dès le').parent()
      lineCanBookFrom.should('contain', 'Non renseignée')
      lineCanBookFrom.should('contain', 'delete')
      cy.get('.t-update-candidat-can-book-from-edit').should('be.disabled')
    })

    it('Should have penalty for candidat without penalty history', () => {
      const canBookFrom = now.plus({ days: 2 })
      const canBookFromTextDate = getFrenchDateFromLuxon(canBookFrom)

      cy.updateCandidat({ email: candidatsByDepartments.email }, { canBookFrom: canBookFrom.toUTC() })
      adminLaunchSearchCandidat(candidatsByDepartments)

      const lineCanBookFrom = cy.get('.t-result-candidat').contains('Réservation possible dès le').parent()
      lineCanBookFrom.should('contain', canBookFromTextDate)
      lineCanBookFrom.should('contain', 'delete')
      cy.get('.t-update-candidat-can-book-from-edit').should('not.be.disabled')
      cy.get('.t-update-candidat-can-book-from-edit').contains('delete').click()

      cy.get('.t-update-candidat-can-book-text').should('contain', 'Voulez-vous vraiment supprimer la pénalité de ce candidat?')
      cy.get('.t-btn-ok').contains('Valider').click()
      const nowTextDateTime = getFrenchDateTimeFromLuxon(getNow())

      cy.get('.t-history-penalties').within((tableauHistory) => {
        cy.get('tbody > tr > :nth-child(2)').should('contain', canBookFromTextDate)
        cy.get('tbody > tr > :nth-child(3)').should('contain', 'Raison inconnue')
        cy.get('tbody > tr > :nth-child(4)').should('contain', Cypress.env('adminLogin'))
        cy.get('tbody > tr > :nth-child(5)').should('contain', nowTextDateTime.substring(0, nowTextDateTime.length - 1))
      })
    })

    it('Should have penalty for candidat many penalty penalty in history ', () => {
      const canBookFrom = now.plus({ days: 2 })
      const canBookFromTextDate = getFrenchDateFromLuxon(canBookFrom)

      cy.updateCandidat({ email: candidatsByDepartments.email }, {
        canBookFrom: canBookFrom.toUTC(),
        canBookFroms: [
          { canBookFrom: canBookFrom.minus({ days: 45 }).toUTC(), reason: 'EXAM_ABSENT', createdAt: now.minus({ days: 60 }).toUTC() },
          { canBookFrom: canBookFrom.toUTC(), reason: 'CANCEL', createdAt: now.minus({ days: 10 }).toUTC() }],
      })
      adminLaunchSearchCandidat(candidatsByDepartments)

      const lineCanBookFrom = cy.get('.t-result-candidat').contains('Réservation possible dès le').parent()
      lineCanBookFrom.should('contain', canBookFromTextDate)
      lineCanBookFrom.should('contain', 'delete')
      cy.get('.t-update-candidat-can-book-from-edit').should('not.be.disabled')
      cy.get('.t-update-candidat-can-book-from-edit').contains('delete').click()

      cy.get('.t-update-candidat-can-book-text').should('contain', 'Voulez-vous vraiment supprimer la pénalité de ce candidat?')
      cy.get('.t-btn-ok').contains('Valider').click()
      const nowTextDateTime = getFrenchDateTimeFromLuxon(getNow())

      cy.get('.t-history-penalties').within((tableauHistory) => {
        cy.get('tbody > tr > :nth-child(2)').should('contain', canBookFromTextDate)
        cy.get('tbody > tr > :nth-child(3)').should('contain', 'Annulation')
        cy.get('tbody > tr > :nth-child(4)').should('contain', Cypress.env('adminLogin'))
        cy.get('tbody > tr > :nth-child(5)').should('contain', nowTextDateTime.substring(0, nowTextDateTime.length - 1))
      })
    })
  } else {
    it('skip for message CODIV 19', () => { cy.log('skip for message CODIV 19') })
  }
})

describe('Search candidat nby ipcsr and date', () => {
  // let nbPlaces = 0
  const datesPlaces = Array(2).fill(true).map((_, index) => now.minus({ days: index + 1 }))
  const candidats = Array(30).fill(true).map((_, index) => ({
    codeNeph: `75612345678901299${index + 1}`,
    prenom: `75CC_FRONT${index + 1}`,
    nomNaissance: `75CANDIDAT_GROUP${index + 1}`,
    adresse: '40 Avenue des terroirs de France 75012 Paris',
    portable: `06${(`00000000${index + 1}`).slice(-8)}`,
    email: `75candidat_group${index + 1}@candi.lib`,
    departement: '75',
    homeDepartement: '75',
    isEvaluationDone: true,
    isValidatedEmail: true,
    isValidatedByAurige: true,
    status: `${index}`,
  }))

  const casesEchec = ['Echec', 'Absent', 'Non examinable', 'Annulé', 'Non recevable']
  const caseNBFailure = 'maxFailed'
  const caseETG = 'ETG'
  const caseSuccess = 'Réussi'
  const cases = [casesEchec, caseNBFailure, caseETG, caseSuccess].flat()

  const datePassage = datesPlaces.slice(-1)[0]

  before(() => {
    cy.deleteCandidat({ prenom: { $regex: '75CC_FRONT' } })
    cy.deleteAllPlaces({ })
    cy.deleteAllArchivedPlaces({ })
    cy.deleteAllMails()
    cy.adminLogin()
    cy.addPlanning(datesPlaces)
    // .its('avalaiblePlaces').then(el => {
    //   nbPlaces = el
    // })

    candidats.forEach(candidat => {
      cy.addCandidat(candidat)
    })

    const aurigeInfos = []
    let idxCandidat = 0

    datesPlaces.forEach((date) => {
      cases.forEach((caseEchec) => {
        const candidat = candidats[idxCandidat++]
        cy.log(JSON.stringify(candidat))
        cy.addCandidatToPlace(date, candidat.nomNaissance)

        aurigeInfos.push({
          codeNeph: candidat.codeNeph,
          nomNaissance: candidat.nomNaissance,
          email: candidat.email,
          dateReussiteETG: now.minus({ years: caseNBFailure === caseEchec ? 3 : 6 }).toISODate(),
          nbEchecsPratiques: caseNBFailure === caseEchec ? '5' : '1',
          dateDernierNonReussite: casesEchec.includes(caseEchec) ? datePassage.toISODate() : '',
          objetDernierNonReussite: casesEchec.includes(caseEchec) ? caseEchec : '',
          reussitePratique: caseSuccess === caseEchec ? datePassage.toISODate() : '',
          candidatExistant: 'OK',
        })
      })
    })

    cy.updatePlaces({}, {
      createdAt: now.minus({ days: 2 }).toUTC(),
      visibleAt: now.minus({ days: 2 }).toUTC(),
    }, true)

    cy.archiveCandidats(aurigeInfos)

    // cy.adminDisconnection()
  })

  it.only('should find info candidats passed exam', () => {
    // cy.adminLogin()
    cy.visit(Cypress.env('frontAdmin') + 'admin/admin-candidat')
    cy.get('.v-tab').should('contain', 'Par inspecteur et date').contains('Par inspecteur et date').click()
    cy.get('.t-input-search-candidat-inspecteur [type=text]').type(Cypress.env('inspecteur'))
    cy.contains(Cypress.env('inspecteur')).click()

    cy.get('.v-snack--active button').should('be.visible').click({ force: true })

    let idxCandidat = 0
    // const neededDate = datesPlaces[0].split('-')
    datesPlaces.forEach((datePlace, index) => {
      const years = datePlace.year
      const month = datePlace.month
      const day = datePlace.day
      const monthDividedByThree = (month / 3)
      const lineNumber = Math.ceil(monthDividedByThree)

      cy.get('.t-date-input').click()
      cy.get('.accent--text > button').click()
      cy.get('.fade-transition-enter-active > .v-date-picker-header > .v-date-picker-header__value > .accent--text > button')
        .click()
      cy.get('.v-date-picker-years').should('contain', `${years}`).contains(`${years}`).click()
      cy.get('.v-date-picker-header').should('contain', `${years}`).should('be.visible')
      cy.get(`.v-date-picker-table > table > tbody > :nth-child(${lineNumber}) > :nth-child(${(month % 3) || 3}) > .v-btn`).click()
      cy.get('.v-date-picker-table > table > tbody td')
        .should('contain', `${day}`)
        .contains(`${day}`).should('be.visible').click()

      const isDateResa = datePlace.hasSame(datePassage, 'days')
      cases.forEach((caseEchec) => {
        const isCaseDisplay = ![caseETG, caseNBFailure].includes(caseEchec)
        const candidat = candidats[idxCandidat++]
        ;['codeNeph', 'nomNaissance', 'portable', 'email'].forEach(key => {
          cy.get('td').should(`${isDateResa && isCaseDisplay ? '' : 'not.'}contain`, candidat[key])
        })
        cy.get('td').should(`${isDateResa && isCaseDisplay ? '' : 'not.'}contain`, caseEchec)
      })
    })
  })
})
