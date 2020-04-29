describe('Contact Us', () => {
  if (Cypress.env('VUE_APP_CLIENT_BUILD_INFO') !== 'COVID') {
    before(() => {
      cy.candidatConnection(Cypress.env('emailCandidatFront'))
      cy.getLastMail().its('Content.Body').then((mailBody) => {
        const codedLink = mailBody.split('href=3D"')[1].split('">')[0]
        const withoutEq = codedLink.replace(/=\r\n/g, '')
        const magicLink = withoutEq.replace(/=3D/g, '=')
        cy.visit(magicLink)
      })
    })

    it('Should get confirm mail to candidat and send mail to admin when candidat is sign-in', () => {
      cy.visit(Cypress.env('frontCandidat') + 'contact-us')

      cy.get('.app-title').should('contain', 'Nous contacter')
      cy.get('.t-contact-us-form').within(($inForm) => {
        cy.get('.contact-us-button').should('contain', 'Envoyer').should('be.disabled')

        cy.get('.t-checkbox').should('not.exist')
        const dataInfos = [
          { label: 'NEPH', value: Cypress.env('codeNephCandidatFront') },
          { label: 'Nom de naissance', value: Cypress.env('candidatFront') },
          { label: 'Prénom', value: Cypress.env('prenomCandidatFront') },
          { label: 'Courriel', value: Cypress.env('emailCandidatFront') },
          { label: 'Portable', value: Cypress.env('portableCandidatFront') },
        ]
        dataInfos.forEach(({ label, value }, index) => {
          cy.get('label').eq(index).should('contain', label)
          cy.get('input').eq(index).should('have.value', value)
          cy.get('.contact-us-button').should('contain', 'Envoyer').should('be.disabled')
        })
        // TODO: A completer avec api
        //   cy.get('.t-select-departements .v-input__slot').click()
        cy.get('.contact-us-button').should('contain', 'Envoyer').should('be.disabled')
      })

      cy.get('.t-contact-us-form').within(($inForm) => {
        const dataInfos = [
          { label: 'Objet du message', value: 'Text de object du message' },
          { label: 'Message', value: 'Text du message écrit par le candidat' },
        ]
        dataInfos.forEach(({ label, value }, index) => {
          cy.get('label').eq(index + 6).should('contain', label)
          cy.get('input, textarea').eq(index + 7).type(value)
        })
      // TODO: A completer avec l api
        //   cy.get('.contact-us-button').should('contain', 'Envoyer').click()
      })
    // TODO: A completer avec l'api
    })

    it('Should get confirm mail to candidat and send mail to admin when candidat is not sign-in', () => {
      cy.visit(Cypress.env('frontCandidat') + 'contact-us', {
        onBeforeLoad: (win) => {
          win.localStorage.clear()
        },
      })

      cy.get('.contact-us-title').should('contain', 'Nous contacter')
      cy.get('.t-contact-us-form').within(($inForm) => {
        cy.get('.contact-us-button').should('contain', 'Envoyer').should('be.disabled')

        cy.get('.t-checkbox').parent().click()
        const dataInfos = [
          { label: 'NEPH', value: Cypress.env('NEPH') },
          { label: 'Nom de naissance', value: Cypress.env('candidat') },
          { label: 'Prénom', value: Cypress.env('firstName') },
          { label: 'Courriel', value: Cypress.env('emailCandidat') },
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
          { label: 'Objet du message', value: 'Text de object du message' },
          { label: 'Message', value: 'Text du message écrit par le candidat' },
        ]
        dataInfos.forEach(({ label, value, typeTag }, index) => {
          cy.get('label').eq(index + 7).should('contain', label)
          cy.get('input, textarea').eq(index + 8).type(value)
        })
        cy.get('.contact-us-button').should('contain', 'Envoyer').click()
      })
    // TODO: A completer avec l'api
    })
  } else {
    it('skip for message CODIV 19', () => { cy.log('skip for message CODIV 19') })
  }
})
