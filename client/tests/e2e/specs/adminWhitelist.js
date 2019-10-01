/* Tests :
- Add single address to the whitelist
- Add a batch of addresses to the whitelist
- Inability to add bad addresses
- Inability to add already added addresses
- Whitelist search
- Removes address from the whitelist grid
- Removes address from the whitelist search
- Ability to create account when the address is in the whitelist
*/

describe('Whitelist tests', () => {
  before(() => {
    // Delete all mails before start
    cy.mhDeleteAll()
    // Creates the aurige file
    cy.writeFile(Cypress.env('filePath') + '/aurige.end.json',
      [
        {
          'codeNeph': Cypress.env('NEPH'),
          'nomNaissance': Cypress.env('candidat'),
          'email': Cypress.env('email'),
          'dateReussiteETG': '',
          'nbEchecsPratiques': '',
          'dateDernierNonReussite': '',
          'objetDernierNonReussite': '',
          'reussitePratique': '',
          'candidatExistant': 'NOK',
        },
      ])
    // Archives the candidate if it's not already done
    cy.visit(Cypress.env('frontAdmin') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    cy.contains('import_export')
      .click()
    const filePath = '../../../' + Cypress.env('filePath') + '/aurige.end.json'
    const fileName = 'aurige.json'
    cy.fixture(filePath).then(fileContent => {
      cy.get('.input-file-container [type=file]')
        .upload({
          fileContent: JSON.stringify(fileContent),
          fileName,
          mimeType: 'application/json',
        })
    })
    cy.get('.v-snack')
      .should('contain', fileName + ' prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Le fichier ' + fileName + ' a été synchronisé.')
    cy.get('.t-disconnect')
      .click()
  })

  it('Whitelist tests', () => {
    cy.visit(Cypress.env('frontCandidat') + 'qu-est-ce-que-candilib')
    cy.contains('Se pré-inscrire')
      .click()
    cy.get('h2')
      .should('contain', 'Réservez votre place d\'examen')
    cy.contains('NEPH')
      .parent()
      .children('input')
      .type(Cypress.env('NEPH'))
    cy.contains('Nom de naissance')
      .parent()
      .children('input')
      .type(Cypress.env('candidat'))
    cy.contains('Prénom')
      .parent()
      .children('input')
      .type(Cypress.env('firstName'))
    cy.contains('Courriel *')
      .parent()
      .children('input')
      .type(Cypress.env('email'))
    cy.contains('Portable')
      .parent()
      .children('input')
      .type('0716253443')
    cy.contains('Adresse')
      .parent()
      .children('input')
      .type('avenue')
    cy.get('.v-select-list')
      .contains('avenue')
      .click()
    cy.contains('Pré-inscription')
      .click()
    cy.get('.v-snack')
      .should('contain', 'L\'adresse courriel renseignée (' + Cypress.env('email') + ') n\'est pas dans la liste des invités')

    cy.visit(Cypress.env('frontAdmin') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    // Visits the whitelist
    cy.visit(Cypress.env('frontAdmin') + 'admin/whitelist')
    cy.get('h2')
      .should('contain', 'Liste blanche')
    // Adds the email
    cy.contains('Ajouter une adresse courriel')
      .click()
    cy.get('.t-add-one-whitelist [type=text]')
      .type(Cypress.env('email') + '{enter}')
    cy.get('.v-snack')
      .should('contain', Cypress.env('email') + ' ajouté à la liste blanche')
    // Tries to add bad addresses
    cy.contains('Ajouter un lot d\'adresse courriel')
      .click()
    cy.get('#whitelist-batch-textarea')
      .type('test.com\ntest@.com\n@test.com\ntest@test\ntest@test.t\n')
    cy.contains('Enregistrer ces adresses')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Aucun email n\'a pu être ajouté à la liste blanche')
    cy.get('.t-whitelist-batch-result')
      .should('contain', 'Adresse invalide')
      .and('not.contain', 'Adresse courriel existante')
      .and('not.contain', 'Adresse enregistrée')
    // Add some addresses
    cy.contains('Ajouter un lot d\'adresse courriel')
      .click()
    cy.get('#whitelist-batch-textarea')
      .type('test@example.com\n' + Cypress.env('email'))
    cy.contains('Enregistrer ces adresses')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Certains emails n\'ont pas pu être ajoutés à la liste blanche')
    cy.get('.t-whitelist-batch-result')
      .should('contain', 'Adresse enregistrée')
      .and('contain', 'Adresse courriel existante')
      .and('not.contain', 'Adresse invalide')
    cy.get('.t-disconnect')
      .click()
    // The candidate fills the pre-sign-up form
    cy.visit(Cypress.env('frontCandidat') + 'qu-est-ce-que-candilib')
    cy.contains('Se pré-inscrire')
      .click()
    cy.get('h2')
      .should('contain', 'Réservez votre place d\'examen')
    cy.contains('NEPH')
      .parent()
      .children('input')
      .type(Cypress.env('NEPH'))
    cy.contains('Nom de naissance')
      .parent()
      .children('input')
      .type(Cypress.env('candidat'))
    cy.contains('Prénom')
      .parent()
      .children('input')
      .type(Cypress.env('firstName'))
    cy.contains('Courriel *')
      .parent()
      .children('input')
      .type(Cypress.env('email'))
    cy.contains('Portable')
      .parent()
      .children('input')
      .type('0716253443')
    cy.contains('Adresse')
      .parent()
      .children('input')
      .type('avenue')
    cy.get('.v-select-list')
      .contains('avenue')
      .click()
    cy.contains('Pré-inscription')
      .click()
    // Verifies the access
    cy.url()
      .should('contain', 'email-validation')
    cy.get('h3')
      .should('contain', 'Validation en attente')
    cy.get('div')
      .should('contain', 'Vous allez bientôt recevoir un courriel à l\'adresse que vous nous avez indiqué.')
    // Validates the email address
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetRecipients()
      .should('contain', Cypress.env('email'))
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetSubject()
      .should('contain', 'Validation d\'adresse courriel pour Candilib')
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetBody().then((mailBody) => {
        const codedLink = mailBody.split('href=3D"')[1].split('">')[0]
        const withoutEq = codedLink.replace(/=\r\n/g, '')
        const validationLink = withoutEq.replace(/=3D/g, '=')
        cy.visit(validationLink)
      })
    cy.get('h3')
      .should('contain', 'Adresse courriel validée')
    cy.visit(Cypress.env('frontAdmin') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    // Visits the whitelist
    cy.visit(Cypress.env('frontAdmin') + 'admin/whitelist')
    cy.get('h2')
      .should('contain', 'Liste blanche')
    // Searches for the email
    cy.get('.search-input [type=text]')
      .type(Cypress.env('email'))
    cy.get('h4')
      .should('contain', 'Adresses correspondant à la recherche (max 5)')
    // Deletes the email
    cy.get('.t-whitelist-search')
      .contains(Cypress.env('email'))
      .parents('.t-whitelist-search')
      .contains('delete')
      .click()
    cy.get('.v-dialog')
      .should('contain', 'Voulez-vous vraiment supprimer l\'adresse ' + Cypress.env('email') + ' de la whitelist ?')
    cy.contains('Oui, supprimer')
      .click()
    cy.get('.v-snack')
      .should('contain', Cypress.env('email') + ' supprimé de la liste blanche')
      .contains('close')
      .click()
    // Deletes test@example.com
    cy.get('.whitelist-grid')
      .contains('test@example.com')
      .parents('[role="listitem"]')
      .should('contain', 'test@example.com')
      .contains('delete')
      .click()
    cy.get('.v-dialog')
      .should('contain', 'Voulez-vous vraiment supprimer l\'adresse test@example.com de la whitelist ?')
    cy.contains('Oui, supprimer')
      .click()
    cy.get('.v-snack')
      .should('contain', 'test@example.com supprimé de la liste blanche')
  })
})
