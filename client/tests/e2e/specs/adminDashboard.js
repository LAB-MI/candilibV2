/* Tests :
- Candidate search and display of the name
- Inspector search and display of the name
- Verifies the display of the centers for the 75 and 93
- Verifies the correct display of the places in the center
- Verifies that the link directs to the right date and center
*/

const csvHeaders = 'Date,Heure,Inspecteur,Non,Centre,Departement'
const horaires = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
]

const csvRowBuilder = (inspecteur, matricule) => horaire => `${Cypress.env('datePlace')},${horaire},${matricule},${inspecteur},${Cypress.env('centre')},75`

const placesInspecteur1 = horaires.map(csvRowBuilder(Cypress.env('inspecteur'), Cypress.env('matricule')))
const placesInspecteur2 = horaires.map(csvRowBuilder(Cypress.env('inspecteur2'), Cypress.env('matricule2')))

const placesArray = [csvHeaders].concat(placesInspecteur1).concat(placesInspecteur2).join('\n')

describe('Dashboard tests', () => {
  before(() => {
    // Delete all mails before start
    cy.mhDeleteAll()
    // Creates the aurige file
    cy.writeFile('tests/e2e/files/aurige.end.json',
      [
        {
          'codeNeph': Cypress.env('NEPH'),
          'nomNaissance': Cypress.env('candidat'),
          'email': Cypress.env('emailCandidat'),
          'dateReussiteETG': '',
          'nbEchecsPratiques': '',
          'dateDernierNonReussite': '',
          'objetDernierNonReussite': '',
          'reussitePratique': '',
          'candidatExistant': 'NOK',
        },
      ])
    // Creates the csv file
    cy.writeFile('tests/e2e/files/planning.csv', placesArray)
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
    const filePath = '../files/aurige.end.json'
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
    // Adds the addresses to the whitelist
    cy.visit(Cypress.env('frontAdmin') + 'admin/whitelist')
    cy.get('h2')
      .should('contain', 'Liste blanche')
    cy.contains('Ajouter un lot d\'adresse courriel')
      .click()
    cy.get('#whitelist-batch-textarea')
      .type(Cypress.env('emailCandidat'))
    cy.contains('Enregistrer ces adresses')
      .click()
    // Adds the places from the created planning file
    cy.contains('calendar_today')
      .click()
    cy.get('.t-import-places [type=checkbox]')
      .check({ force: true })
    const filePath1 = '../files/planning.csv'
    const fileName1 = 'planning.csv'
    cy.fixture(filePath1).then(fileContent => {
      cy.get('[type=file]').upload({ fileContent, fileName: fileName1, mimeType: 'text/csv' })
    })
    cy.get('.v-snack')
      .should('contain', fileName1 + ' prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click({ force: true })
    cy.get('.v-snack', { timeout: 10000 })
      .should('contain', 'Le fichier ' + fileName1 + ' a été traité pour le departement 75.')
    cy.contains('exit_to_app')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes déconnecté·e')
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
      .type(Cypress.env('emailCandidat'))
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
      .should('contain', Cypress.env('emailCandidat'))
    cy.mhGetAllMails()
      .mhFirst()
      .mhGetSubject()
      .should('contain', 'Validation d\'adresse email pour Candilib')
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
  })

  it('Searches for candidate', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    // Searches for candidate
    cy.get('.t-search-candidat [type=text]')
      .type(Cypress.env('candidat'))
    cy.contains(Cypress.env('candidat'))
      .click()
    cy.get('h3')
      .should('contain', 'Informations candidats')
    cy.get('.t-result-candidat')
      .contains('Nom')
      .parent()
      .should('contain', Cypress.env('candidat'))
  })

  it('Searches for inspector', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    // Searches for inspector
    cy.get('.t-search-inspecteur [type=text]')
      .type(Cypress.env('inspecteur'))
    cy.contains(Cypress.env('inspecteur'))
      .click()
    cy.get('h3')
      .should('contain', 'informations inspecteur')
    cy.get('.t-result-inspecteur')
      .contains('Nom')
      .parent()
      .should('contain', Cypress.env('inspecteur'))
  })

  it('Verifies the number of centers in the 75 and 93', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    // Verifies the number of centers in the 75 and 93
    cy.get('.layout.row.wrap').children()
      .should('have.length', 3)
    cy.get('.hexagon-wrapper').contains('93')
      .click()
    cy.get('.layout.row.wrap').children()
      .should('have.length', 4)
    cy.get('.hexagon-wrapper').contains('75')
      .click()
  })

  it('Goes to the planning by clicking on a date', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    // Goes to 14/10/2019 in the planning
    cy.get('h2.title')
      .should('contain', Cypress.env('centre'))
      .contains(Cypress.env('centre'))
      .parents('.monitor-wrapper').within(($centre) => {
        cy.contains('14 oct. 2019')
          .parents('tr').within(($row) => {
            cy.get('button').first()
              .within(($button) => {
                cy.get('.v-btn__content > :nth-child(3) > strong')
                  .invoke('text').as('placesDispo')
                cy.root().click()
              })
          })
      })
    cy.url()
      .should('contain', '2019-10-14')
    cy.get('.t-date-picker [type=text]').invoke('val')
      .should('contain', '14/10/2019')
    cy.get('.v-tabs__item--active')
      .should('contain', Cypress.env('centre'))
    // Verifies the number of places available
    cy.get('.v-window-item').not('[style="display: none;"]')
      .should('have.length', 1)
      .within(($window) => {
        cy.get('@placesDispo').then((placesDispo) => {
          cy.get('.place-button .v-icon:contains("check_circle")')
            .should('have.length', placesDispo)
        })
      })
  })
})
