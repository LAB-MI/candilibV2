/* Tests :
CONNECTED CANDIDATE FRONT
- Display of the FAQ
- Display of the 'Mentions Légales'
- Display of the profile
- Ability to add a reservation
- Ability to change the reservation
- Ability to resend confirmation mail
- Ability to cancel a reservation
- Confirmation email
- Cancellation email

PUBLIC CANDIDATE FRONT
- Display of the FAQ when not connected
- Display of the 'Mentions Légales' when not connected
- Ability to go back to the introduction page
*/

import { now, date1 } from '../support/dateUtils'

describe('Connected candidate front', () => {
  if (Cypress.env('VUE_APP_CLIENT_BUILD_INFO') !== 'COVID') {
    // Initialise magicLink
    let magicLink
    const numberOfDaysBeforeDate = 7
    const numberOfDaysPenalty = 45 // 45éme jours inclus et 46 eme jours reservable //TODO: A vérifier
    const arbitraryValue = 7
    const nowIn1Week = now.plus({ days: numberOfDaysBeforeDate + arbitraryValue })
    const nowIn1WeekAnd1DaysBefore = now.plus({ days: (numberOfDaysBeforeDate - 1) })
    const bookedPlaceIn45Days = nowIn1WeekAnd1DaysBefore.plus({ days: numberOfDaysPenalty })
    const dayAfter46thDays = bookedPlaceIn45Days.plus({ days: 1 })
    const dayAfter45Days = dayAfter46thDays.plus({ days: 1 }).weekday > 6 ? dayAfter46thDays.plus({ days: 1 }) : dayAfter46thDays
    const dayBefore45Days = bookedPlaceIn45Days.minus({ days: (bookedPlaceIn45Days.weekday === 1 ? 2 : 1) })
    const FORMAT_DATE_TEXT = {
      weekday: 'long',
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    }

    const candidatsByDepartments = [{
      codeNeph: '6123456789012',
      prenom: 'CC_FRONT',
      nomNaissance: 'CANDIDAT_FRONT_75',
      adresse: '40 Avenue des terroirs de France 75012 Paris',
      portable: '0676543986',
      email: 'candidat_front_75@candi.lib',
      departement: '75',
      isEvaluationDone: false,
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

    before(() => {
    // Delete all mails before start
      cy.deleteAllMails()
      cy.deleteAllPlaces()
      cy.adminLogin()
      cy.archiveCandidate()
      cy.addPlanning([nowIn1Week, nowIn1WeekAnd1DaysBefore, dayAfter45Days, dayBefore45Days])
      cy.adminDisconnection()
      cy.updatePlaces({}, { createdAt: now.minus({ days: 2 }).toUTC() }, true)
      cy.candidatConnection(Cypress.env('emailCandidatFront'))

      cy.getLastMail().its('Content.Body').then((mailBody) => {
        const codedLink = mailBody.split('href=3D"')[1].split('">')[0]
        const withoutEq = codedLink.replace(/=\r\n/g, '')
        magicLink = withoutEq.replace(/=3D/g, '=')
      })

      cy.updatePlaces({}, { createdAt: now.minus({ days: 2 }).toUTC() }, true)
    })

    after(() => {
      candidatsByDepartments.forEach(candidat => {
        cy.deleteCandidat({ email: candidat.email })
      })
    })
    it('Should display FAQ', () => {
      cy.visit(magicLink).wait(1000)
      cy.get('i').should('contain', 'help_outline')
      cy.contains('help_outline').click()
      cy.url().should('contain', 'faq')
      cy.get('h2').should('contain', 'F.A.Q')

      cy.get('.question-content').should('not.be.visible')
      cy.get('.question')
        .contains('?')
        .click()
      cy.get('.question-content').should('be.visible')
    })

    it('Should display Mentions légales', () => {
      cy.visit(magicLink).wait(1000)
      cy.get('i').should('contain', 'account_balance')
      cy.contains('account_balance').click()
      cy.url().should('contain', 'mentions-legales')
      cy.get('h2').should('contain', 'Mentions légales')
    })

    it('Should display the profile page', () => {
      cy.visit(magicLink)
      cy.wait(1000)
      cy.get('.t-my-profile')
        .click()
      cy.url()
        .should('contain', 'mon-profil')
      cy.get('h2')
        .should('contain', 'Mon profil')
      cy.get('.v-chip').should('contain', 'Nom de naissance')
      cy.contains('Nom de naissance')
        .parent().parent()
        .should('contain', Cypress.env('candidatFront'))
    })
    it('Should book a place at 7th days', () => {
      cy.visit(magicLink)
      cy.wait(1000)

      cy.checkAndSelectDepartement()
      cy.wait(100)
      cy.get('h2').should('contain', 'Choix du centre')
      cy.get('body').should('contain', Cypress.env('centre'))
      cy.contains(Cypress.env('centre')).click()
      cy.get(`[href="#tab-${nowIn1Week.monthLong}"]`).click()
      cy.reload(true)
      const oneDayBeforeSelected = nowIn1WeekAnd1DaysBefore.toFormat('dd')
      cy.get('body').should('not.contain', ' ' + oneDayBeforeSelected)
      const daySelected = nowIn1Week.toFormat('dd')
      cy.get('body').should('contain', ' ' + daySelected + ' ')
      cy.contains(' ' + daySelected + ' ')
        .parents('.v-list-group').click()

      cy.get('.v-list-group--active')
        .within($date => {
          cy.get('.container')
            .should('not.contain', '06h30-07h00')
            .and('not.contain', '16h00-16h30')
            .and('not.contain', '12h30-13h00')
          cy.get('.container')
            .should('contain', '08h30-09h00')
          cy.contains('08h30-09h00').click()
        })
      cy.get('h2').should('contain', 'Confirmation')
      cy.get('h3').should('contain', Cypress.env('centre'))
      cy.get('[type=checkbox]')
        .first()
        .check({ force: true })
      cy.get('[type=checkbox]')
        .last()
        .check({ force: true })
      cy.get('button')
        .should('contain', 'Confirmer')
      cy.get('button')
        .contains('Confirmer')
        .click()
      cy.get('.v-snack--active').should(
        'contain',
        'Votre réservation a bien été prise en compte',
      )
      cy.get('h2').should('contain', 'Ma réservation')
      cy.get('h3').should('contain', Cypress.env('centre'))
      cy.get('p').should('contain', 'à 08:30')
      cy.getLastMail()
        .getRecipients()
        .should('contain', Cypress.env('emailCandidatFront'))
      cy.getLastMail()
        .getSubject()
        .should(
          'contain',
          '=?UTF-8?Q?Convocation_=C3=A0_l=27examen_pratique_d?= =?UTF-8?Q?u_permis_de_conduire?=',
        )
      cy.getLastMail()
        .its('Content.Body')
        .should('contain', Cypress.env('centre').toUpperCase())
        .and('contain', '8:30')
      cy.get('.t-evaluation', { timeout: 10000 }).should(
        'contain',
        'Merci de noter Candilib',
      )
      cy.wait(1000)
      cy.get('.t-evaluation-submit').click()
    })

    it.skip('Should book a place', () => {
      cy.visit(magicLink)
      cy.wait(1000)

      cy.checkAndSelectDepartement()
      cy.wait(100)
      cy.get('h2').should('contain', 'Choix du centre')
      cy.get('body').should('contain', Cypress.env('centre'))
      cy.contains(Cypress.env('centre')).click()
      cy.get(`[href="#tab-${date1.monthLong}"]`).click()
      cy.get('body').should('contain', ' ' + Cypress.env('placeDate').split('-')[2] + ' ')
      cy.contains(' ' + Cypress.env('placeDate').split('-')[2] + ' ')
        .parents('.v-list')
        .within($date => {
          cy.root().click()
          cy.get('.container')
            .should('not.contain', '06h30-07h00')
            .and('not.contain', '16h00-16h30')
            .and('not.contain', '12h30-13h00')
          cy.get('.container')
            .should('contain', '08h30-09h00')
          cy.contains('08h30-09h00').click()
        })
      cy.get('h2').should('contain', 'Confirmation')
      cy.get('h3').should('contain', Cypress.env('centre'))
      cy.get('[type=checkbox]')
        .first()
        .check({ force: true })
      cy.get('[type=checkbox]')
        .last()
        .check({ force: true })
      cy.get('button')
        .should('contain', 'Confirmer')
      cy.get('button')
        .contains('Confirmer')
        .click()
      cy.get('.v-snack--active').should(
        'contain',
        'Votre réservation a bien été prise en compte',
      )
      cy.get('h2').should('contain', 'Ma réservation')
      cy.get('h3').should('contain', Cypress.env('centre'))
      cy.get('p').should('contain', 'à 08:30')
      cy.getLastMail()
        .getRecipients()
        .should('contain', Cypress.env('emailCandidatFront'))
      cy.getLastMail()
        .getSubject()
        .should(
          'contain',
          '=?UTF-8?Q?Convocation_=C3=A0_l=27examen_pratique_d?= =?UTF-8?Q?u_permis_de_conduire?=',
        )
      cy.getLastMail()
        .its('Content.Body')
        .should('contain', Cypress.env('centre').toUpperCase())
        .and('contain', '8:30')
      cy.get('.t-evaluation', { timeout: 10000 }).should(
        'contain',
        'Merci de noter Candilib',
      )
      cy.wait(1000)
      cy.get('.t-evaluation-submit').click()
    })

    it('Should change the booked place', () => {
      cy.visit(magicLink)
      cy.get('.t-candidat-home').click()
      cy.get('body').should('contain', 'Modifier ma réservation')
      cy.contains('Modifier ma réservation').click()

      cy.checkAndSelectDepartement()
      cy.wait(100)
      cy.get('body').should('contain', Cypress.env('centre'))
      cy.contains(Cypress.env('centre')).click()
      cy.get(`[href="#tab-${date1.monthLong}"]`).click()
      cy.get('body').should('contain', ' ' + Cypress.env('placeDate').split('-')[2] + ' ')
      cy.contains(' ' + Cypress.env('placeDate').split('-')[2] + ' ')
        .parents('.v-list')
        .within($date => {
          cy.root().click()
          cy.get('.container').should('contain', '10h00-10h30')
          cy.get('.container').contains('10h00-10h30').click()
        })
      cy.get('h2').should('contain', 'Confirmer la modification')
      cy.get('h3').should('contain', Cypress.env('centre'))
      cy.get('[type=checkbox]')
        .first()
        .check({ force: true })
      cy.get('[type=checkbox]')
        .last()
        .check({ force: true })
      cy.get('button')
        .should('contain', 'Confirmer')
      cy.get('button')
        .contains('Confirmer')
        .click()
      cy.get('.v-snack--active').should(
        'contain',
        'Votre réservation a bien été prise en compte',
      )
      cy.get('h2').should('contain', 'Ma réservation')
      cy.get('h3').should('contain', Cypress.env('centre'))
      cy.get('p').should('contain', 'à 10:00')
      cy.getLastMail()
        .getRecipients()
        .should('contain', Cypress.env('emailCandidatFront'))
      cy.getLastMail()
        .getSubject()
        .should(
          'contain',
          '=?UTF-8?Q?Convocation_=C3=A0_l=27examen_pratique_d?= =?UTF-8?Q?u_permis_de_conduire?=',
        )
      cy.getLastMail()
        .its('Content.Body')
        .should('contain', Cypress.env('centre').toUpperCase())
        .and('contain', '10:00')
      cy.getLastMail({
        subject:
        '=?UTF-8?Q?Annulation_de_votre_convocation_=C3=A0_l?= =?UTF-8?Q?=27examen?=',
      }).should('have.property', 'Content')
    })

    it('Should resend convocation', () => {
      cy.visit(magicLink)
      cy.get('body').should('contain', 'Renvoyer ma convocation')
      cy.contains('Renvoyer ma convocation').click()
      cy.get('.v-snack--active').should(
        'contain',
        'Votre convocation a été envoyée dans votre boîte mail.',
      )
      cy.getLastMail()
        .getRecipients()
        .should('contain', Cypress.env('emailCandidatFront'))
      cy.getLastMail()
        .getSubject()
        .should(
          'contain',
          '=?UTF-8?Q?Convocation_=C3=A0_l=27examen_pratique_d?= =?UTF-8?Q?u_permis_de_conduire?=',
        )
      cy.getLastMail()
        .its('Content.Body')
        .should('contain', Cypress.env('centre').toUpperCase())
        .and('contain', '10:00')
    })

    it('Should resend confirmation mail', () => {
      cy.visit(magicLink)
      cy.get('body').should('contain', 'Renvoyer ma convocation').click()
      cy.contains('Renvoyer ma convocation').click()
      cy.get('.v-snack--active').should(
        'contain',
        'Votre convocation a été envoyée dans votre boîte mail.',
      )
      cy.getLastMail()
        .getRecipients()
        .should('contain', Cypress.env('emailCandidatFront'))
      cy.getLastMail()
        .getSubject()
        .should(
          'contain',
          '=?UTF-8?Q?Convocation_=C3=A0_l=27examen_pratique_d?= =?UTF-8?Q?u_permis_de_conduire?=',
        )
      cy.getLastMail()
        .its('Content.Body')
        .should('contain', Cypress.env('centre').toUpperCase())
        .and('contain', '10:00')
    })

    it('Should cancel booked place', () => {
      cy.visit(magicLink)
      cy.get('body').should('contain', 'Annuler ma réservation')
      cy.contains('Annuler ma réservation').click()
      cy.get('button')
        .should('contain', 'Confirmer')
      cy.get('button')
        .contains('Confirmer')
        .click()
      cy.get('.v-snack--active').should(
        'contain',
        'Votre annulation a bien été prise en compte.',
      )

      cy.get('h2').should('contain', 'Choix du département')
      cy.getLastMail()
        .getRecipients()
        .should('contain', Cypress.env('emailCandidatFront'))
      cy.getLastMail()
        .getSubject()
        .should(
          'contain',
          '=?UTF-8?Q?Annulation_de_votre_convocation_=C3=A0_l?= =?UTF-8?Q?=27examen?=',
        )
      cy.getLastMail()
        .its('Content.Body')
        .should('contain', Cypress.env('centre').toUpperCase())
        .and('contain', '10:00')
    })

    const expectedPenaltyCancel = () => {
    // Vérifie si le message d'avertissement pour le cas de pénalité est présent
      const canBookFromAfterCancel = bookedPlaceIn45Days.toLocaleString(FORMAT_DATE_TEXT)
      cy.get('.t-warning-message')
        .should('contain', `Vous avez annulé ou modifié votre réservation à moins de ${numberOfDaysBeforeDate} jours de la date d'examen.`)
        .and('contain', `Vous ne pouvez sélectionner une date qu'à partir du ${canBookFromAfterCancel}`)
      // Verifie s'il y a des places sur le 1er mois
      const nbMonthsBefore45Days = dayAfter45Days.diff(now, 'months').months | 0
      for (let nbMonth = 0; nbMonth < nbMonthsBefore45Days; nbMonth++) {
        const monthLong = now.plus({ months: nbMonth }).monthLong
        cy.get(`[href="#tab-${monthLong}"]`).click()
        cy.get(`.t-tab-${monthLong}`).should('contain', "Il n'y a pas de créneau disponible pour ce mois.")
      }

      // Verifie s'il y a des places dans le mois du 45eme jours
      cy.get(`[href="#tab-${dayAfter45Days.monthLong}"]`).click()
      cy.get(`.t-tab-${dayAfter45Days.monthLong}`).should('contain', dayAfter45Days.toLocaleString(FORMAT_DATE_TEXT))
      cy.get(`[href="#tab-${dayBefore45Days.monthLong}"]`).click()
      cy.get(`.t-tab-${dayBefore45Days.monthLong}`).should('not.contain', dayBefore45Days.toLocaleString(FORMAT_DATE_TEXT))
    }

    it('Should have a penalty when candidat change the booked place within 6 days', () => {
      cy.adminLogin()
      cy.addCandidatToPlace(nowIn1WeekAnd1DaysBefore, Cypress.env('candidatFront'))
      cy.adminDisconnection()

      cy.visit(magicLink)
      cy.get('.t-candidat-home').click()
      cy.get('body').should('contain', 'Modifier ma réservation')
      cy.contains('Modifier ma réservation').click()

      // Vérifie si le message d'avertissement pour le cas de pénalité est présent
      cy.get('.t-confirm-suppr-text-content')
        .should('contain', 'Conformément aux règles de gestion de candilib vous ne pourrez pas choisir une nouvelle date avant un délai de')
        .and('contain', `${numberOfDaysPenalty} jours`)
        .and('contain', 'après le')
        .and('contain', `${nowIn1WeekAnd1DaysBefore.toLocaleString(FORMAT_DATE_TEXT)}`)
        .and('contain', "Vous pourrez donc sélectionner une date qu'à partir du")
        .and('contain', bookedPlaceIn45Days.toLocaleString(FORMAT_DATE_TEXT))

      cy.get('body').should('contain', 'Continuer')
      cy.contains('Continuer').click()

      cy.checkAndSelectDepartement()
      cy.wait(100)
      cy.get('body').should('contain', Cypress.env('centre'))
      cy.contains(Cypress.env('centre')).click()
      expectedPenaltyCancel()

      cy.get(`[href="#tab-${dayAfter45Days.monthLong}"]`).click()
      cy.get('body').should('contain', dayAfter45Days.toLocaleString(FORMAT_DATE_TEXT))
      cy.contains(dayAfter45Days.toLocaleString(FORMAT_DATE_TEXT))
        .parents('.v-list')
        .within($date => {
          cy.root().click()
          cy.get('.container').should('contain', '10h00-10h30')
          cy.get('.container')
            .contains('10h00-10h30').click()
        })
      cy.get('h2').should('contain', 'Confirmer la modification')
      cy.get('h3').should('contain', Cypress.env('centre'))
      cy.get('[type=checkbox]')
        .first()
        .check({ force: true })
      cy.get('[type=checkbox]')
        .last()
        .check({ force: true })
      cy.get('button')
        .should('contain', 'Confirmer')
      cy.get('button')
        .contains('Confirmer')
        .click()
      cy.get('.v-snack--active').should(
        'contain',
        'Votre réservation a bien été prise en compte',
      )
      cy.get('h2').should('contain', 'Ma réservation')
      cy.get('h3').should('contain', Cypress.env('centre'))
      cy.get('p').should('contain', 'à 10:00')
      cy.getLastMail()
        .getRecipients()
        .should('contain', Cypress.env('emailCandidatFront'))
      cy.getLastMail()
        .getSubject()
        .should(
          'contain',
          '=?UTF-8?Q?Convocation_=C3=A0_l=27examen_pratique_d?= =?UTF-8?Q?u_permis_de_conduire?=',
        )
      cy.getLastMail()
        .its('Content.Body')
        .should('contain', Cypress.env('centre').toUpperCase())
        .and('contain', '10:00')
      cy.getLastMail({
        subject:
        '=?UTF-8?Q?Annulation_de_votre_convocation_=C3=A0_l?= =?UTF-8?Q?=27examen?=',
      }).should('have.property', 'Content')
    })

    it('Should have a penalty when candidat cancel within 6 days of booked place ', () => {
      cy.adminLogin()
      cy.addCandidatToPlace(nowIn1WeekAnd1DaysBefore, Cypress.env('candidatFront'))
      cy.adminDisconnection()

      cy.visit(magicLink)
      cy.get('body').should('contain', 'Annuler ma réservation')
      cy.contains('Annuler ma réservation').click()
      // Vérifie si le message d'avertissement pour le cas de pénalité est présent
      cy.get('.t-confirm-suppr-text-content')
        .should('contain', `De plus, étant à moins de ${numberOfDaysBeforeDate} jours de la date d`)
        .and('contain', `un délai de repassage de ${numberOfDaysPenalty} jours`)

      cy.get('button')
        .should('contain', 'Confirmer')
      cy.get('button')
        .contains('Confirmer')
        .click()
      cy.get('.v-snack--active').should(
        'contain',
        'Votre annulation a bien été prise en compte.',
      )

      cy.checkAndSelectDepartement()
      cy.wait(100)
      cy.get('h2').should('contain', 'Choix du centre')
      cy.get('body').should('contain', Cypress.env('centre'))
      cy.contains(Cypress.env('centre')).click()
      expectedPenaltyCancel()
      cy.getLastMail()
        .getRecipients()
        .should('contain', Cypress.env('emailCandidatFront'))
      cy.getLastMail()
        .getSubject()
        .should(
          'contain',
          '=?UTF-8?Q?Annulation_de_votre_convocation_=C3=A0_l?= =?UTF-8?Q?=27examen?=',
        )
      cy.getLastMail()
        .its('Content.Body')
        .should('contain', Cypress.env('centre').toUpperCase())
        .and('contain', '7:00')
    })

    it('Should disconnect', () => {
      cy.visit(magicLink)
      cy.url().should('contain', 'home')

      cy.get('.t-disconnect')
        .click()
      cy.url().should('contain', 'presignup')
    })

    it('Should have alert info 75 for 75', () => {
      cy.addCandidat(candidatsByDepartments[0])
      cy.getNewMagicLinkCandidat('candidat_front_75@candi.lib').then(mLink => {
        cy.visit(mLink)
        cy.wait(100)
        cy.get('h2').should('contain', 'Choix du département')
        cy.get('body').should('contain', 'Les centres utilisés par le département 75 sont localisés hors 75 et sont les suivants')
      })
    })

    it('Should have not alert info 75 for 93', () => {
      cy.addCandidat(candidatsByDepartments[1])
      cy.getNewMagicLinkCandidat('candidat_front_93@candi.lib').then(mLink => {
        cy.visit(mLink)
        cy.wait(100)
        cy.get('h2').should('contain', 'Choix du département')
        cy.get('body').should('not.contain', 'Les centres utilisés par le département 75 sont localisés hors 75 et sont les suivants')
      })
    })
  } else {
    it('skip for message CODIV 19', () => { cy.log('skip for message CODIV 19') })
  }
})

describe('Public candidate front', () => {
  it('Should display FAQ', () => {
    cy.visit(Cypress.env('frontCandidat') + 'qu-est-ce-que-candilib')
    cy.get('.t-faq').first().click()
    cy.url().should('contain', 'faq')
    cy.get('h2').should('contain', 'F.A.Q')
    cy.get('.question-content').should('not.be.visible')
    cy.get('.question')
      .should('contain', '?')
    cy.get('.question')
      .contains('?')
      .click()
    cy.get('.question-content').should('be.visible')
    cy.get('.home-link').click()
    if (Cypress.env('VUE_APP_CLIENT_BUILD_INFO') !== 'COVID') {
      cy.url().should('contain', 'qu-est-ce-que-candilib')
    }
  })

  it('Should display Mentions Légales', () => {
    cy.visit(Cypress.env('frontCandidat') + 'qu-est-ce-que-candilib')
    cy.get('.t-mentions-legales')
      .click()
    cy.url()
      .should('contain', 'mentions-legales')
    cy.get('h2')
      .should('contain', 'Mentions légales')
    cy.visit(Cypress.env('frontCandidat') + 'candidat-presignup')
  })
})
