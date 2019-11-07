/* Tests :
  candidate nonReussite stats
  candidate no receivable
  candidate no examinable
  candidate absent
  candidate success
*/

describe('Stats Kpi tests', () => {
  let nbPlaces = 0
  beforeEach(() => {
    cy.mhDeleteAll()
    // login admin
    cy.adminLogin()
    // archive candidat already in db
    cy.archiveCandidate()
    // ajouter des places
    cy.addPlanning()
    // ajouter email candidat a la white list
    cy.addToWhitelist()
    // deconnecter l'admin
    cy.adminDisconnection()
    // pre-inscription candidat
    cy.candidatePreSignUp()
    cy.adminLogin()
    // validation candidat pas aurige
    cy.candidateValidation()
    // deconnecter l'admin
    cy.adminDisconnection()
    nbPlaces = Cypress.env('nbPlaces')
  })

  const nbInscrits = 1
  const nbBooked = 1
  let nbExams = 0
  let nbNotExamined = 0
  let nbFailed = 0

  it('Checks candidate nonReussite stats', () => {
    cy.adminLogin()
    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + Cypress.env('placeDate'))

    cy.get('.t-remplissage-futur')
      .should('contain', '0.00%')

    cy.get('.t-number-inscrit-' + nbInscrits)
      .should('have.length', 1)

    cy.get('.t-number-future-free-places-' + nbPlaces)
      .should('have.length', 1)

    cy.addCandidatToPlace()

    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + Cypress.env('placeDate'))

    cy.get('.t-number-inscrit-' + (nbInscrits - nbBooked))
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + (nbPlaces - nbBooked))
      .should('have.length', 1)
    cy.get('.t-remplissage-futur')
      .should('contain', Number(nbBooked / nbPlaces * 100).toFixed(2))

    cy.writeFile(Cypress.env('filePath') + '/aurige.nonReussite.json',
      [
        {
          'codeNeph': Cypress.env('NEPH'),
          'nomNaissance': Cypress.env('candidat'),
          'email': Cypress.env('emailCandidat'),
          'dateReussiteETG': '2018-10-12',
          'nbEchecsPratiques': '0',
          'dateDernierNonReussite': Cypress.env('placeDate'),
          'objetDernierNonReussite': 'Echec',
          'reussitePratique': '',
          'candidatExistant': 'OK',
        },
      ])
    cy.contains('import_export')
      .click()

    const filePath = '../../../' + Cypress.env('filePath') + '/aurige.nonReussite.json'
    const fileName = 'aurige.nonReussite.json'
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

    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + Cypress.env('placeDate'))
    nbExams++
    nbFailed++

    cy.get('.t-number-inscrit-' + (nbInscrits - nbBooked))
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + nbPlaces)
      .should('have.length', 1)
    cy.get('.v-snack button').should('be.visible').click({ force: true })
    cy.adminDisconnection()
  })

  it('Checks candidate no receivable', () => {
    cy.adminLogin()
    cy.addCandidatToPlace()
    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + Cypress.env('placeDate'))

    cy.get('.t-number-inscrit-' + (nbInscrits - nbBooked))
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + (nbPlaces - nbInscrits))
      .should('have.length', 1)

    cy.writeFile(Cypress.env('filePath') + '/aurige.nonRecevable.json',
      [
        {
          'codeNeph': Cypress.env('NEPH'),
          'nomNaissance': Cypress.env('candidat'),
          'email': Cypress.env('emailCandidat'),
          'dateReussiteETG': '2018-10-12',
          'nbEchecsPratiques': '0',
          'dateDernierNonReussite': Cypress.env('placeDate'),
          'objetDernierNonReussite': 'Non recevable',
          'reussitePratique': '',
          'candidatExistant': 'OK',
        },
      ])

    cy.contains('import_export')
      .click()

    const filePath = '../../../' + Cypress.env('filePath') + '/aurige.nonRecevable.json'
    const fileName = 'aurige.nonRecevable.json'
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
    nbExams++
    nbNotExamined++

    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + Cypress.env('placeDate'))

    cy.get('.t-number-inscrit-' + nbInscrits)
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + nbPlaces)
      .should('have.length', 1)
    cy.get('.v-snack button').should('be.visible').click({ force: true })
    cy.adminDisconnection()
  })

  it('Checks candidate no examinable', () => {
    cy.adminLogin()
    cy.addCandidatToPlace()
    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + Cypress.env('placeDate'))

    cy.get('.t-number-inscrit-' + (nbInscrits - nbBooked))
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + (nbPlaces - nbBooked))
      .should('have.length', 1)

    cy.writeFile(Cypress.env('filePath') + '/aurige.nonExaminable.json',
      [
        {
          'codeNeph': Cypress.env('NEPH'),
          'nomNaissance': Cypress.env('candidat'),
          'email': Cypress.env('emailCandidat'),
          'dateReussiteETG': '2018-10-12',
          'nbEchecsPratiques': '0',
          'dateDernierNonReussite': Cypress.env('placeDate'),
          'objetDernierNonReussite': 'Non examinable',
          'reussitePratique': '',
          'candidatExistant': 'OK',
        },
      ])

    cy.contains('import_export')
      .click()

    const filePath = '../../../' + Cypress.env('filePath') + '/aurige.nonExaminable.json'
    const fileName = 'aurige.nonExaminable.json'
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
    nbExams++
    nbNotExamined++
    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + Cypress.env('placeDate'))

    cy.get('.t-number-inscrit-' + nbInscrits)
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + nbPlaces)
      .should('have.length', 1)
    cy.get('.t-non-examines')
      .should('contain', Number(nbNotExamined / nbExams * 100).toFixed(2))
    cy.get('.v-snack button').should('be.visible').click({ force: true })
    cy.adminDisconnection()
  })

  it('Checks candidate absent', () => {
    cy.adminLogin()
    cy.addCandidatToPlace()
    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + Cypress.env('placeDate'))

    cy.get('.t-number-inscrit-' + (nbInscrits - nbBooked))
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + (nbPlaces - nbBooked))
      .should('have.length', 1)

    cy.writeFile(Cypress.env('filePath') + '/aurige.absent.json',
      [
        {
          'codeNeph': Cypress.env('NEPH'),
          'nomNaissance': Cypress.env('candidat'),
          'email': Cypress.env('emailCandidat'),
          'dateReussiteETG': '2018-10-12',
          'nbEchecsPratiques': '0',
          'dateDernierNonReussite': Cypress.env('placeDate'),
          'objetDernierNonReussite': 'Absent',
          'reussitePratique': '',
          'candidatExistant': 'OK',
        },
      ])

    cy.contains('import_export')
      .click()

    const filePath = '../../../' + Cypress.env('filePath') + '/aurige.absent.json'
    const fileName = 'aurige.absent.json'
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
    nbExams++

    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + Cypress.env('placeDate'))

    cy.get('.t-number-inscrit-' + nbInscrits)
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + nbPlaces)
      .should('have.length', 1)
    cy.get('.t-absenteisme')
      .should('contain', Number(1 / nbExams * 100).toFixed(2))
    cy.get('.v-snack button').should('be.visible').click({ force: true })
    cy.adminDisconnection()
  })

  it('Checks candidate success', () => {
    cy.adminLogin()
    cy.addCandidatToPlace()
    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + Cypress.env('placeDate'))

    cy.get('.t-number-inscrit-' + (nbInscrits - nbBooked))
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + (nbPlaces - nbBooked))
      .should('have.length', 1)

    cy.writeFile(Cypress.env('filePath') + '/aurige.reussite.json',
      [
        {
          'codeNeph': Cypress.env('NEPH'),
          'nomNaissance': Cypress.env('candidat'),
          'email': Cypress.env('emailCandidat'),
          'dateReussiteETG': '2018-10-12',
          'nbEchecsPratiques': '0',
          'dateDernierNonReussite': '',
          'objetDernierNonReussite': '',
          'reussitePratique': Cypress.env('placeDate'),
          'candidatExistant': 'OK',
        },
      ])

    cy.contains('import_export')
      .click()

    const filePath = '../../../' + Cypress.env('filePath') + '/aurige.reussite.json'
    const fileName = 'aurige.reussite.json'
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
    nbExams++
    const nbSuccess = 1
    cy.visit(Cypress.env('frontAdmin') + 'admin/stats-kpi/' + Cypress.env('placeDate') + '/' + Cypress.env('placeDate'))

    cy.get('.t-number-inscrit-0')
      .should('have.length', 1)
    cy.get('.t-number-future-free-places-' + nbPlaces)
      .should('have.length', 1)
    cy.get('.t-reussite')
      .should('contain', Number(nbSuccess / (nbSuccess + nbFailed) * 100).toFixed(2))
    cy.get('.t-total-places-' + nbExams)
      .should('have.length', 1)
    cy.get('.v-snack button').should('be.visible').click({ force: true })
    cy.adminDisconnection()
  })
})
