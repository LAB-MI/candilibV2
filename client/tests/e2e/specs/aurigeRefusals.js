/* Tests :
- Aurige refusal because of unknown NEPH & mail
- Aurige refusal because of unknown name & mail
- Aurige refusal because of expired ETG & mail
- Aurige refusal because of missing ETG & mail
- Aurige refusal because of 5 failed attempts & mail
*/
const nephs = [
  '093123456789', '093458736982', '093571369217',
  '093621795384', '093365721896', '093874320867',
]
const names = [
  'MAD', 'ROCKATANSKY', 'CUTTER', 'GOOSE', 'BOY', 'BURNS',
]
const firstNames = [
  'MAX', 'JESSIE', 'TOE', 'JIM', 'JOHNNY', 'TIM',
]
var fileCandidates = []
for (var i = 0; i < 6; ++i) {
  fileCandidates[i] = {
    codeNeph: nephs[i],
    nomNaissance: names[i],
    prenom: firstNames[i],
    dateReussiteETG: '2018-10-25',
    nbEchecsPratiques: '0',
    dateDernierNonReussite: '',
    objetDernierNonReussite: '',
    reussitePratique: '',
    candidatExistant: 'OK',
  }
}
fileCandidates[0].reussitePratique = '2019-02-04'
fileCandidates[1].candidatExistant = 'NOK'
fileCandidates[2].candidatExistant = 'NOK Nom'
fileCandidates[3].dateReussiteETG = '2013-04-09'
fileCandidates[4].dateReussiteETG = ''
fileCandidates[5].nbEchecsPratiques = '5'

describe('Aurige Refusals', () => {
  before(() => {
    // Delete all mails before start
    cy.mhDeleteAll()
    // Creates the aurige file
    cy.writeFile('tests/e2e/files/aurige.json', fileCandidates)
  })

  it('Refuses the validation', () => {
    cy.visit(Cypress.env('frontAdmin') + 'admin-login')
    cy.get('[type=text]')
      .type(Cypress.env('adminLogin'))
    cy.get('[type=password]')
      .type(Cypress.env('adminPass'))
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes identifié')
    // Goes to the page
    cy.contains('import_export')
      .click()
    // Uploads the JSON file
    const filePath = '../files/aurige.json'
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
      .should('contain', 'aurige.json prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Le fichier aurige.json a été synchronisé.')
    // Verifies the error messages
    cy.get('.ag-cell')
      .should('contain', 'Pour le 75, ce candidat madmax@candilib.com sera archivé : PRATIQUE OK')
      .and('contain', 'Pour le 75, ce candidat 093458736982/ROCKATANSKY sera archivé : NEPH inconnu')
      .and('contain', 'Pour le 75, ce candidat 093571369217/CUTTER sera archivé : Nom inconnu')
      .and('contain', 'Pour le 75, ce candidat jimgoose@candilib.com sera archivé : Date ETG KO')
      .and('contain', 'Pour le 75, ce candidat johnnyboy@candilib.com sera archivé : dateReussiteETG invalide')
      .and('contain', 'Pour le 75, ce candidat timburns@candilib.com sera archivé : A 5 échecs pratiques')
    cy.mhGetMailsByRecipient('madmax@candilib.com')
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Probl=C3=A8me_inscription_Candilib?=')
    cy.mhGetMailsByRecipient('madmax@candilib.com')
      .mhFirst()
      .mhGetBody()
      .should('contain', 'vous avez d=C3=A9j=C3=A0 =\r\nr=C3=A9ussi votre examen du permis de conduire')
    cy.mhGetMailsByRecipient('jessierockatansky@candilib.com')
      .should('have.length', 1)
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Inscription_Candilib_non_valid=C3=A9e?=')
    cy.mhGetMailsByRecipient('jessierockatansky@candilib.com')
      .mhFirst()
      .mhGetBody()
      .should('contain', 'Malheureusement les informations\r\n    que vous avez fournies sont erron=C3=A9es')
    cy.mhGetMailsByRecipient('toecutter@candilib.com')
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Inscription_Candilib_non_valid=C3=A9e?=')
    cy.mhGetMailsByRecipient('toecutter@candilib.com')
      .mhFirst()
      .mhGetBody()
      .should('contain', 'Malheureusement les informations\r\n    que vous avez fournies sont erron=C3=A9es')
    cy.mhGetMailsByRecipient('jimgoose@candilib.com')
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Probl=C3=A8me_inscription_Candilib?=')
    cy.mhGetMailsByRecipient('jimgoose@candilib.com')
      .mhFirst()
      .mhGetBody()
      .should('contain', 'Votre code de la route n=E2=80=99est pas/plus =\r\nvalide.')
    cy.mhGetMailsByRecipient('johnnyboy@candilib.com')
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Probl=C3=A8me_inscription_Candilib?=')
    cy.mhGetMailsByRecipient('johnnyboy@candilib.com')
      .mhFirst()
      .mhGetBody()
      .should('contain', 'Votre code de la route n=E2=80=99est pas/plus =\r\nvalide.')
    cy.mhGetMailsByRecipient('timburns@candilib.com')
      .mhFirst()
      .mhGetSubject()
      .should('contain', '=?UTF-8?Q?Probl=C3=A8me_inscription_Candilib?=')
    cy.mhGetMailsByRecipient('timburns@candilib.com')
      .mhFirst()
      .mhGetBody()
      .should('contain', 'Votre code de la route n=E2=80=99est pas/plus =\r\nvalide.')
  })
})
