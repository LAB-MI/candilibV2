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
    cy.deleteAllMails()
    // Creates the aurige file
    cy.writeFile(Cypress.env('filePath') + '/aurige.json', fileCandidates)
  })

  it('Refuses the validation', () => {
    cy.adminLogin()
    // Goes to the page
    cy.contains('import_export')
      .click()
    // Uploads the JSON file
    const filePath = '../../../' + Cypress.env('filePath') + '/aurige.json'
    const fileName = 'aurige.json'
    cy.get('.input-file-container [type=file]')
      .attachFile({
        filePath,
        fileName,
        mimeType: 'application/json',
      })

    cy.get('.v-snack--active')
      .should('contain', 'aurige.json prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click()
    cy.get('.v-snack--active')
      .should('contain', 'Le fichier aurige.json a été synchronisé.')
    // Checks the error messages
    cy.get('.ag-cell')
      .should('contain', 'Pour le 75, ce candidat madmax@candilib.com sera archivé : PRATIQUE OK')
      .and('contain', 'Pour le 75, ce candidat 093458736982/ROCKATANSKY sera archivé : NEPH inconnu')
      .and('contain', 'Pour le 75, ce candidat 093571369217/CUTTER sera archivé : Nom inconnu')
      .and('contain', 'Pour le 75, ce candidat jimgoose@candilib.com sera archivé : Date ETG KO')
      .and('contain', 'Pour le 75, ce candidat johnnyboy@candilib.com sera archivé : Date ETG est invalide')
      .and('contain', 'Pour le 75, ce candidat timburns@candilib.com sera archivé : A 5 échecs pratiques')
    cy.getLastMail({ recipient: 'madmax@candilib.com' })
      .then($mail => {
        cy.wrap($mail)
          .getSubject()
          .should('contain', 'Information Candilib')
        cy.wrap($mail)
          .its('Content.Body')
          .should('contain', 'vous avez =\r\nd=C3=A9j=C3=A0 r=C3=A9ussi votre examen du permis de conduire,\r\nnotre service ne vous est plus utile.')
      })
    cy.getLastMail({ recipient: 'jessierockatansky@candilib.com' })
      .then($mail => {
        cy.wrap($mail)
          .getSubject()
          .should('contain', '=?UTF-8?Q?Inscription_Candilib_non_valid=C3=A9e?=')
        cy.wrap($mail)
          .its('Content.Body')
          .should('contain', 'Malheureusement les informations que vous avez fournies sont erron=C3=A9es')
      })
    cy.getLastMail({ recipient: 'toecutter@candilib.com' })
      .then($mail => {
        cy.wrap($mail)
          .getSubject()
          .should('contain', '=?UTF-8?Q?Inscription_Candilib_non_valid=C3=A9e?=')
        cy.wrap($mail)
          .its('Content.Body')
          .should('contain', 'Malheureusement les informations que vous avez fournies sont erron=C3=A9es')
      })
    cy.getLastMail({ recipient: 'jimgoose@candilib.com' })
      .then($mail => {
        cy.wrap($mail)
          .getSubject()
          .should('contain', '=?UTF-8?Q?Probl=C3=A8me_inscription_Candilib?=')
        cy.wrap($mail)
          .its('Content.Body')
          .should('contain', 'Votre code de la route n=E2=80=99est =\r\npas/plus valide.')
      })
    cy.getLastMail({ recipient: 'johnnyboy@candilib.com' })
      .then($mail => {
        cy.wrap($mail)
          .getSubject()
          .should('contain', '=?UTF-8?Q?Probl=C3=A8me_inscription_Candilib?=')
        cy.wrap($mail)
          .its('Content.Body')
          .should('contain', 'Votre code de la route n=E2=80=99est =\r\npas/plus valide.')
      })
    cy.getLastMail({ recipient: 'timburns@candilib.com' })
      .then($mail => {
        cy.wrap($mail)
          .getSubject()
          .should('contain', '=?UTF-8?Q?Probl=C3=A8me_inscription_Candilib?=')
        cy.wrap($mail)
          .its('Content.Body')
          .should('contain', 'Votre code de la route n=E2=80=99est =\r\npas/plus valide.')
      })
  })
})
