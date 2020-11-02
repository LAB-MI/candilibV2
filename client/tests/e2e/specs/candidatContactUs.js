import { now } from '../support/dateUtils'

describe('Contact Us', () => {
  if (Cypress.env('VUE_APP_CLIENT_BUILD_INFO') !== 'COVID') {
    before(() => {
      cy.deleteAllMails()
      cy.candidatConnection(Cypress.env('emailCandidatContactUs'))
      cy.getLastMail().its('Content.Body').then((mailBody) => {
        const codedLink = mailBody.split('href=3D"')[1].split('">')[0]
        const withoutEq = codedLink.replace(/=\r\n/g, '')
        const magicLink = withoutEq.replace(/=3D/g, '=')
        cy.visit(magicLink)
      })
    })

    const subjectForCandidat = 'Prise en compte de votre demande'
    const subject = 'Text de object du message'
    const message = 'Text du message du candidat'

    it('Should get confirm mail to candidat and send mail to admin when candidat is sign-in', () => {
      if (!Cypress.env('API_CONTACT_US')) {
        cy.server()
        cy.route('GET', Cypress.env('frontCandidat') + 'api/v2/candidat/me', {
          candidat: {
            codeNeph: Cypress.env('codeNephCandidatContactUs'),
            nomNaissance: Cypress.env('candidatContactUs'),
            prenom: Cypress.env('prenomCandidatContactUs'),
            email: Cypress.env('emailCandidatContactUs'),
            portable: Cypress.env('portableCandidatContactUs'),
            departement: Cypress.env('departementCandidatContactUs'),
            homeDepartement: Cypress.env('homeDepartementCandidatContactUs'),
          },
        })
        cy.route('GET', Cypress.env('frontCandidat') + 'api/v2/auth/candidat/verify-token?token=test_token', { auth: true })
        cy.route('POST', Cypress.env('frontCandidat') + 'api/v2/candidat/contact-us', { success: true })
        cy.AddFakeMail(Cypress.env('emailCandidatContactUs'), subjectForCandidat, '<html></html>')
        cy.AddFakeMail(Cypress.env('emailRepartiteur93'), subject, '<html><p>' + message + '</p></html>')
        cy.visit(Cypress.env('frontCandidat') + 'contact-us', {
          onBeforeLoad: (win) => {
            win.fetch = null
            win.localStorage.setItem('token', 'test_token')
          },
        })
      } else {
        cy.visit(Cypress.env('frontCandidat') + 'contact-us')
      }

      cy.get('.app-title').should('contain', 'Nous contacter')
      cy.get('.t-contact-us-form').within(($inForm) => {
        cy.get('.contact-us-button').should('contain', 'Envoyer').should('be.disabled')

        cy.get('.t-checkbox').should('not.exist')
        const dataInfos = [
          { label: 'NEPH', value: Cypress.env('codeNephCandidatContactUs') },
          { label: 'Nom de naissance', value: Cypress.env('candidatContactUs') },
          { label: 'Prénom', value: Cypress.env('prenomCandidatContactUs') },
          { label: 'Courriel', value: Cypress.env('emailCandidatContactUs') },
          { label: 'Portable', value: Cypress.env('portableCandidatContactUs') },
        ]
        dataInfos.forEach(({ label, value }, index) => {
          cy.get('label').eq(index).should('contain', label)
          cy.get('input').eq(index).should('have.value', value)
          cy.get('.contact-us-button').should('contain', 'Envoyer').should('be.disabled')
        })
        cy.get('.t-select-departements').should('contain', Cypress.env('homeDepartementCandidatContactUs'))
        cy.get('.contact-us-button').should('contain', 'Envoyer').should('be.disabled')
      })

      cy.get('.t-contact-us-form').within(($inForm) => {
        const dataInfos = [
          { label: 'Objet du message', value: subject },
          { label: 'Message', value: message },
        ]
        dataInfos.forEach(({ label, value }, index) => {
          cy.get('label').eq(index + 6).should('contain', label)
          cy.get('input, textarea').eq(index + 7).type(value)
        })
        cy.get('.contact-us-button').should('contain', 'Envoyer').click()
      })

      cy.get('.v-snack--active').should(
        'contain',
        'Votre demande a été envoyé.',
      )

      cy.getLastMail({ recipient: Cypress.env('emailRepartiteur93') })
        .then($mail => {
          cy.wrap($mail)
            .getSubject()
            .should('contain', subject)
          cy.wrap($mail)
            .its('Content.Body')
            .should('contain', message)
        })

      cy.getLastMail({ subject: subjectForCandidat, recipient: Cypress.env('emailCandidatContactUs') })
        .getSubject().should('contain', subjectForCandidat)

      if (!Cypress.env('API_CONTACT_US')) {
        cy.server({ enable: false })
      }
    })

    it('Should get confirm mail to candidat and send mail to admin when candidat is not sign-in', () => {
      cy.deleteAllMails()
      if (!Cypress.env('API_CONTACT_US')) {
        cy.server()
        cy.route('POST', Cypress.env('frontCandidat') + 'api/v2/candidat/contact-us', { success: true })
        cy.AddFakeMail(Cypress.env('emailCandidat'), subjectForCandidat, '<html></html>')
        cy.AddFakeMail(Cypress.env('emailRepartiteur'), subject, '<html><p>' + message + '</p></html>')

        cy.visit(Cypress.env('frontCandidat') + 'contact-us', {
          onBeforeLoad: (win) => {
            win.fetch = null
            win.localStorage.clear()
          },
        })
      } else {
        cy.visit(Cypress.env('frontCandidat') + 'contact-us', {
          onBeforeLoad: (win) => {
            win.localStorage.clear()
          },
        })
      }
      cy.get('.contact-us-title').should('contain', 'Nous contacter')
      cy.get('.t-contact-us-form').within(($inForm) => {
        cy.get('.contact-us-button').should('contain', 'Envoyer').should('be.disabled')
        cy.get('.t-checkbox').parent().click()
        const dataInfos = [
          { label: 'NEPH', value: Cypress.env('NEPH') },
          { label: 'Nom de naissance', value: Cypress.env('candidat') },
          { label: 'Prénom', value: Cypress.env('firstName') },
          { label: 'Courriel', value: Cypress.env('emailCandidat') },
          { label: 'Portable', value: Cypress.env('portableCandidatContactUs') },
        ]
        dataInfos.forEach(({ label, value }, index) => {
          cy.get('label').eq(index + 1).should('contain', label)
          cy.get('input').eq(index + 1).type(value)
          cy.get('.contact-us-button').should('contain', 'Envoyer').should('be.disabled')
        })
        cy.get('.t-select-departements .v-input__slot').click()
      })
      cy.get('.v-list-item')
        .contains(Cypress.env('departement'))
        .click()
      cy.get('.contact-us-button').should('contain', 'Envoyer').should('be.disabled')
      cy.get('.t-contact-us-form').within(($inForm) => {
        const dataInfos = [
          { label: 'Objet du message', value: subject },
          { label: 'Message', value: message },
        ]
        dataInfos.forEach(({ label, value, typeTag }, index) => {
          cy.get('label').eq(index + 7).should('contain', label)
          cy.get('input, textarea').eq(index + 8).type(value)
        })
        cy.get('.contact-us-button').should('contain', 'Envoyer').click()
      })

      cy.get('.v-snack--active').should(
        'contain',
        'Votre demande a été envoyé.',
      )

      cy.getLastMail({ recipient: Cypress.env('emailRepartiteur') })
        .then($mail => {
          cy.wrap($mail)
            .getSubject()
            .should('contain', subject)
          cy.wrap($mail)
            .its('Content.Body')
            .should('contain', message)
        })

      cy.getLastMail({ subject: subjectForCandidat, recipient: Cypress.env('emailCandidat') })
        .getSubject().should('contain', subjectForCandidat)

      if (!Cypress.env('API_CONTACT_US')) {
        cy.server({ enable: false })
      }
    })
  } else {
    it('skip for message CODIV 19', () => { cy.log('skip for message CODIV 19') })
  }
})

describe('From FAQ, To go to the page Contact Us', () => {
  before(() => {
    cy.deleteAllMails()
    cy.candidatConnection(Cypress.env('emailCandidatContactUs'))
    cy.getLastMail().its('Content.Body').then((mailBody) => {
      const codedLink = mailBody.split('href=3D"')[1].split('">')[0]
      const withoutEq = codedLink.replace(/=\r\n/g, '')
      const magicLink = withoutEq.replace(/=3D/g, '=')
      cy.visit(magicLink)
    })
  })

  it('should go to contact us from FAQ by candidat no signin', () => {
    cy.visit(Cypress.env('frontCandidat') + 'faq')
    cy.contains('Aide / Contact').click()
    cy.get('.question-subtitle').should('contain', 'formulaire')
    cy.get('a[href*="contact-us"]').click()
    cy.url().should('contain', Cypress.env('frontCandidat') + 'candidat/contact-us')
    cy.get('h2').should('contain', 'Nous contacter')
  })

  it('should go to contact us from FAQ by candidat no signin', () => {
    cy.visit(Cypress.env('frontCandidat') + 'faq', {
      onBeforeLoad: (win) => {
        win.localStorage.clear()
      },
    })
    cy.contains('Aide / Contact').click()
    cy.get('.question-subtitle').should('contain', 'formulaire')
    cy.get('a[href*="contact-us"]').click()
    cy.url().should('contain', Cypress.env('frontCandidat') + 'contact-us')
    cy.get('h3').should('contain', 'Nous contacter')
  })
})

describe('From the mails, To go to the page Contact Us', () => {
  const candidat = {
    codeNeph: '01234567890111',
    nomNaissance: 'CANDIDAT_PRESIGNUP_CONTACTUS',
    email: 'candidat.presignup.contactus@test.com',
  }

  const checkContactUsForUnsignedByMail = (email, subject) => {
    cy.getLastMail({
      recipient: email,
      subjectContains: subject,
    })
      .its('Content')
      .then((Content) => {
        const subject = Content.Headers.Subject[0]
        expect(subject).to.contain(subject)

        const mailBody = Content.Body.replace(/=\r\n/g, '').replace(/=3D/g, '=')
        expect(mailBody).to.match(/href=".*">formulaire en ligne/)
        const codedLink = mailBody.match(/href="(.*)">formulaire en ligne/)
        expect(codedLink).to.have.lengthOf(2)
        expect(codedLink[1]).to.not.match(/token/)
        cy.visit(codedLink[1])
        cy.get('h3').should('contain', 'Nous contacter')
      })
  }
  const checkContactUsForSignedByMail = (email, subject) => {
    cy.getLastMail({
      recipient: email,
    })
      .its('Content')
      .then((Content) => {
        const subject = Content.Headers.Subject[0]
        expect(subject).to.contain(subject)

        const mailBody = Content.Body.replace(/=\r\n/g, '').replace(/=3D/g, '=')
        expect(mailBody).to.match(/href=".*">formulaire en ligne/)
        const codedLink = mailBody.match(/href="(.*)">formulaire en ligne/)
        expect(codedLink).to.have.lengthOf(2)
        expect(codedLink[1]).to.match(/token/)
        cy.visit(codedLink[1])
        cy.get('h2').should('contain', 'Nous contacter')
      })
  }
  let magicLink
  before(() => {
    cy.adminLogin()
    cy.addPlanning()
    cy.candidatConnection(Cypress.env('emailCandidatContactUs'))
    cy.getLastMail().its('Content.Body').then((mailBody) => {
      const codedLink = mailBody.split('href=3D"')[1].split('">')[0]
      const withoutEq = codedLink.replace(/=\r\n/g, '')
      magicLink = withoutEq.replace(/=3D/g, '=')
    })
    cy.updatePlaces({}, {
      createdAt: now.minus({ days: 2 }).toUTC(),
      visibleAt: now.minus({ days: 2 }).toUTC(),
    }, true)
  })
  beforeEach(() => {
    cy.deleteAllMails()
    cy.visit(Cypress.env('frontCandidat') + 'contact-us', {
      onBeforeLoad: (win) => {
        win.localStorage.clear()
      },
    })
  })

  // Candidat Signin
  it('should go to the page contact-us signin from the sign-in mail  ', () => {
    cy.candidatConnection(Cypress.env('emailCandidatContactUs'))
    checkContactUsForSignedByMail(Cypress.env('emailCandidatContactUs'), 'Validation_de_votre_inscription_')
  })

  // Candidat presignup
  it('should go to the page contact-us no-signin from the mail presign-up ', () => {
    cy.candidatePreSignUp(candidat)
    checkContactUsForUnsignedByMail(candidat.email, "Validation d'adresse courriel pour Candilib")
  })

  // Candidat is valided
  it('should go to the page contact-us no-signin from the aurige valided mail  ', () => {
    cy.adminLogin()
    cy.candidateValidation(candidat)
    checkContactUsForUnsignedByMail(candidat.email, 'Validation_de_votre_inscription_')
  })

  // Candidat convocation
  it('should go to the page contact-us signin from the convocation mail', () => {
    cy.adminLogin()
    cy.addCandidatToPlace(undefined, candidat.nomNaissance)
    cy.wait(100)
    checkContactUsForSignedByMail(candidat.email, 'Convocation')
  })

  // Candidat failed 5 times
  it('should go to the page contact-us no-signin from the aurige 5 failed mail  ', () => {
    candidat.nbEchecsPratiques = '5'
    candidat.dateDernierNonReussite = now.minus({ days: 5 }).toFormat('yyyy-MM-dd')
    candidat.objetDernierNonReussite = 'Echec'

    cy.adminLogin()
    cy.candidateValidation(candidat, 'aurige5failed.json', false)
    checkContactUsForUnsignedByMail(candidat.email, 'Probl=C3=A8me_inscription_Candilib')
  })

  // Candidat cancel
  it('should go to the page contact-us signin from the cancel mail', () => {
    cy.adminLogin()
    cy.addCandidatToPlace(undefined, Cypress.env('candidatContactUs'))
    cy.visit(magicLink)
    cy.get('body').should('contain', 'Annuler ma réservation')
    cy.contains('Annuler ma réservation').click()
    cy.get('button')
      .should('contain', 'Confirmer')
    cy.get('button')
      .contains('Confirmer')
      .click()

    cy.visit(Cypress.env('frontCandidat') + 'contact-us', {
      onBeforeLoad: (win) => {
        win.localStorage.clear()
      },
    })
    checkContactUsForSignedByMail(Cypress.env('emailCandidatContactUs'), 'Annulation_de_votre_convocation_')
  })
})
