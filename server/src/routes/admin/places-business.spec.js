import { DateTime } from 'luxon'
import { connect, disconnect } from '../../mongo-connection'

import {
  importPlacesCsv,
  sendMailSchedulesInspecteurs,
  sendMailSchedulesAllInspecteurs,
} from './places-business'

import { getScheduleInspecteurBody } from '../business/send-mail-schedule-inspecteur'

import { createCentre } from '../../models/centre'
import { createPlace } from '../../models/place'
import { createInspecteur } from '../../models/inspecteur'
import {
  FRENCH_LOCALE_INFO,
  getFrenchLuxon,
  getFrenchFormattedDateTime,
} from '../../util'

import {
  bookCandidatOnSelectedPlace,
  createCandidatAndUpdate,
  commonBasePlaceDateTime,
} from '../../models/__tests__'

jest.mock('../../util/logger')
jest.mock('../business/send-mail')

const bookedAt = getFrenchLuxon().toJSDate()

const centre = {
  departement: '93',
  nom: 'Villepinte',
  adresse:
    'avenue Jean Fourgeaud (dernier parking circulaire) 93420 Villepinte',
  lat: '48.962099',
  label: "Centre d'examen du permis de conduire de Villepinte",
  lon: '2.552847',
}

const getCsvFileData = csvFileDataInJson => {
  const csvFileHeader =
    ',,,' + '\n' + 'Date,Heure,Matricule,Nom,Centre,Departement'

  return (
    csvFileHeader +
    csvFileDataInJson.reduce(
      (cumul, current) =>
        cumul +
        '\n' +
        current.date +
        ', ' +
        current.hour +
        ', ' +
        current.matricule +
        ', ' +
        current.nom +
        ', ' +
        current.centre +
        ', ' +
        current.departement,
      ''
    )
  )
}

const expectOneResultWithError = (
  result,
  csvFileDataInJson,
  index,
  messageFct
) => {
  expect(result).toHaveProperty('departement', '93')
  expect(result).toHaveProperty(
    'centre',
    csvFileDataInJson[index].centre.trim()
  )
  const matricule =
    csvFileDataInJson[index].matricule &&
    csvFileDataInJson[index].matricule.trim()

  expect(result).toHaveProperty(
    'inspecteur',
    matricule === undefined ? 'undefined' : matricule || ''
  )
  const date = csvFileDataInJson[index].date.trim()
  const hour = csvFileDataInJson[index].hour.trim()
  expect(result).toHaveProperty('date', `${date} ${hour}`)
  expect(result).toHaveProperty('status', 'error')
  expect(result).toHaveProperty('message', messageFct(csvFileDataInJson, index))
}

describe('Test import places from CSV', () => {
  const inspecteurs = [
    {
      email: 'dupont.jacques@email.fr',
      nom: 'dupont',
      prenom: 'jacques',
      matricule: '01020304',
      departement: '93',
    },
    {
      email: 'dupont.jean@email.fr',
      nom: 'dupont',
      prenom: 'Jean',
      matricule: '01020305',
      departement: '93',
    },
  ]

  let inspecteursCreated
  beforeAll(async () => {
    await connect()
    await createCentre(
      centre.nom,
      centre.label,
      centre.adresse,
      centre.lon,
      centre.lat,
      centre.departement
    )
    inspecteursCreated = await Promise.all(
      inspecteurs.map(inspecteur => createInspecteur(inspecteur))
    )
    require('../../util/logger').setWithConsole(false)
  })

  afterAll(async () => {
    await disconnect()
  })

  it('should have errors when fields are missing ', async () => {
    const csvFileDataInJson = [
      {
        date: ' ',
        hour: '08:00',
        matricule: '01020301',
        nom: 'dupond',
        centre: 'BOBIGNY',
        departement: '93',
      },
      {
        date: '06/07/19',
        hour: ' ',
        matricule: '01020301',
        nom: 'dupond',
        centre: 'BOBIGNY',
        departement: '93',
      },
      {
        date: '06/07/19',
        hour: '08:30',
        matricule: ' ',
        nom: 'dupond',
        centre: 'BOBIGNY',
        departement: '93',
      },
      {
        date: '06/07/19',
        hour: '08:30',
        matricule: '01020301',
        nom: ' ',
        centre: 'BOBIGNY',
        departement: '93',
      },
      {
        date: '06/07/19',
        hour: '08:30',
        matricule: '01020301',
        nom: 'dupond',
        centre: ' ',
        departement: '93',
      },
      {
        date: '06/07/19',
        hour: '08:30',
        matricule: '01020301',
        nom: 'dupond',
        centre: 'BOBIGNY',
        departement: '',
      },
      {
        date: '06/07/19',
        hour: '08:30',
        nom: 'dupond',
        centre: 'BOBIGNY',
        departement: '',
      },
    ]
    const data = getCsvFileData(csvFileDataInJson)

    const results = await importPlacesCsv({
      csvFile: { data },
      departement: '93',
    })

    expect(results).toBeDefined()
    expect(results).toHaveLength(csvFileDataInJson.length)
    results.forEach((result, index) => {
      expectOneResultWithError(
        result,
        csvFileDataInJson,
        index,
        (dataInJson, i) => {
          const {
            date,
            hour,
            matricule,
            nom,
            centre,
            departement,
          } = dataInJson[i]
          return `Une ou plusieurs information(s) manquante(s) dans le fichier CSV ou XLSX.
        [
          date: ${date && date.trim()},
          heur: ${hour && hour.trim()},
          matricule: ${matricule && matricule.trim()},
          nom: ${nom && nom.trim()},
          centre: ${centre && centre.trim()},
          departement: ${departement && departement.trim()}
        ]`
        }
      )
    })
  })

  it('should have errors when departements are different ', async () => {
    const csvFileDataInJson = [
      {
        date: '06/07/19',
        hour: '08:00',
        matricule: '01020301',
        nom: 'dupond',
        centre: 'BOBIGNY',
        departement: '75',
      },
      {
        date: '06/07/19',
        hour: '08:30',
        matricule: '01020301',
        nom: 'dupond',
        centre: 'BOBIGNY',
        departement: '94',
      },
    ]
    const data = getCsvFileData(csvFileDataInJson)

    const results = await importPlacesCsv({
      csvFile: { data },
      departement: '93',
    })

    expect(results).toBeDefined()
    expect(results).toHaveLength(csvFileDataInJson.length)
    expect(results[0])
    expectOneResultWithError(
      results[0],
      csvFileDataInJson,
      0,
      (dataInJson, i) =>
        'Le département du centre (75) ne correspond pas au département dont vous avez la charge (93)'
    )
    expectOneResultWithError(
      results[1],
      csvFileDataInJson,
      1,
      (dataInJson, i) =>
        'Le département du centre (94) ne correspond pas au département dont vous avez la charge (93)'
    )
  })

  it('should have errors when centres are unknown ', async () => {
    const csvFileDataInJson = [
      {
        date: '06/07/19',
        hour: '08:00',
        matricule: '01020301',
        nom: 'dupond',
        centre: 'BOBIGNY',
        departement: '93',
      },
      {
        date: '06/07/19',
        hour: '08:30',
        matricule: '01020301',
        nom: 'dupond',
        centre: 'BOBIGNY',
        departement: '93',
      },
    ]
    const data = getCsvFileData(csvFileDataInJson)

    const results = await importPlacesCsv({
      csvFile: { data },
      departement: '93',
    })

    expect(results).toBeDefined()
    expect(results).toHaveLength(2)
    results.forEach((result, index) => {
      expectOneResultWithError(
        result,
        csvFileDataInJson,
        index,
        (dataInJson, i) => `Le centre ${dataInJson[i].centre} est inconnu`
      )
    })
  })

  it('should have errors when inspecteurs are unknown', async () => {
    const csvFileDataInJson = [
      {
        date: '06/07/19',
        hour: '08:00',
        matricule: '01020302',
        nom: 'dupond2',
        centre: 'VILLEPINTE',
        departement: '93',
      },
      {
        date: '06/07/19',
        hour: '08:00',
        matricule: '01020303',
        nom: 'dupond3',
        centre: 'VILLEPINTE',
        departement: '93',
      },
    ]
    const data = getCsvFileData(csvFileDataInJson)
    const results = await importPlacesCsv({
      csvFile: { data },
      departement: '93',
    })

    expect(results).toBeDefined()
    expect(results).toHaveLength(2)
    results.forEach((result, index) => {
      expectOneResultWithError(
        result,
        csvFileDataInJson,
        index,
        (dataInJson, i) => `L'inspecteur ${dataInJson[i].matricule} est inconnu`
      )
    })
  })

  it('should have errors when inspecteurs names are differents', async () => {
    const csvFileDataInJson = [
      {
        date: '06/07/19',
        hour: '08:00',
        matricule: '01020304',
        nom: 'dupond4',
        centre: 'VILLEPINTE',
        departement: '93',
      },
      {
        date: '06/07/19',
        hour: '08:00',
        matricule: '01020305',
        nom: 'dupond5',
        centre: 'VILLEPINTE',
        departement: '93',
      },
    ]
    const data = getCsvFileData(csvFileDataInJson)
    const results = await importPlacesCsv({
      csvFile: { data },
      departement: '93',
    })
    expect(results).toBeDefined()
    expect(results).toHaveLength(2)
    results.forEach((result, index) => {
      expectOneResultWithError(
        result,
        csvFileDataInJson,
        index,
        (dataInJson, i) => {
          const nom = dataInJson[i].nom.trim()
          const matricule = dataInJson[i].matricule.trim()
          return `Le nom "${nom}" de l'inspecteur ne correspond pas au matricule "${matricule}"`
        }
      )
    })
  })

  it('should create place ', async () => {
    const csvFileDataInJson = [
      {
        date: '06/07/19',
        hour: '08:00',
        matricule: '01020304',
        nom: 'dupont',
        centre: 'VILLEPINTE',
        departement: '93',
      },
      {
        date: '06/07/19',
        hour: '08:00',
        matricule: '01020305',
        nom: 'dupont',
        centre: 'VILLEPINTE',
        departement: '93',
      },
    ]
    const data = getCsvFileData(csvFileDataInJson)
    const results = await importPlacesCsv({
      csvFile: { data },
      departement: '93',
    })

    expect(results).toBeDefined()
    expect(results).toHaveLength(csvFileDataInJson.length)
    results.forEach((result, index) => {
      const inspecteurExpected = inspecteursCreated.find(
        inspecteur =>
          inspecteur.matricule === csvFileDataInJson[index].matricule
      )

      const date = DateTime.fromFormat(
        csvFileDataInJson[index].date + ' ' + csvFileDataInJson[index].hour,
        'dd/MM/yy HH:mm',
        FRENCH_LOCALE_INFO
      )
      expect(result).toHaveProperty('departement', '93')
      expect(result).toHaveProperty('centre', centre.nom)
      expect(result).toHaveProperty('inspecteur', inspecteurExpected._id)
      expect(result).toHaveProperty('date', date)
      expect(result).toHaveProperty('status', 'success')
      expect(result).toHaveProperty('message', 'Place enregistrée en base')
    })
  })

  it('should not create same places ', async () => {
    const csvFileDataInJson = [
      {
        date: '06/07/19',
        hour: '08:30',
        matricule: '01020304',
        nom: 'dupont',
        centre: 'VILLEPINTE',
        departement: '93',
      },
      {
        date: '06/07/19',
        hour: '08:30',
        matricule: '01020305',
        nom: 'dupont',
        centre: 'VILLEPINTE',
        departement: '93',
      },
    ]
    const data = getCsvFileData(csvFileDataInJson)
    await importPlacesCsv({
      csvFile: { data },
      departement: '93',
    })

    const results = await importPlacesCsv({
      csvFile: { data },
      departement: '93',
    })

    expect(results).toBeDefined()
    expect(results).toHaveLength(csvFileDataInJson.length)
    results.forEach((result, index) => {
      const inspecteurExpected = inspecteursCreated.find(
        inspecteur =>
          inspecteur.matricule === csvFileDataInJson[index].matricule
      )

      const date = DateTime.fromFormat(
        csvFileDataInJson[index].date + ' ' + csvFileDataInJson[index].hour,
        'dd/MM/yy HH:mm',
        FRENCH_LOCALE_INFO
      )
      expect(result).toHaveProperty('departement', '93')
      expect(result).toHaveProperty('centre', centre.nom)
      expect(result).toHaveProperty('inspecteur', inspecteurExpected._id)
      expect(result).toHaveProperty('date', date)
      expect(result).toHaveProperty('status', 'error')
      expect(result).toHaveProperty('message', 'Place déjà enregistrée en base')
    })
  })

  it('should have errors when the places have unauthorized hours', async () => {
    const csvFileDataInJson = [
      {
        date: '06/07/19',
        hour: '06:00',
        matricule: '01020304',
        nom: 'dupont',
        centre: 'VILLEPINTE',
        departement: '93',
      },
      {
        date: '06/07/19',
        hour: '08:15',
        matricule: '01020304',
        nom: 'dupont',
        centre: 'VILLEPINTE',
        departement: '93',
      },
      {
        date: '06/07/19',
        hour: '12:00',
        matricule: '01020304',
        nom: 'dupont',
        centre: 'VILLEPINTE',
        departement: '93',
      },
      {
        date: '06/07/19',
        hour: '22:00',
        matricule: '01020304',
        nom: 'dupont',
        centre: 'VILLEPINTE',
        departement: '93',
      },
    ]
    const data = getCsvFileData(csvFileDataInJson)
    const results = await importPlacesCsv({
      csvFile: { data },
      departement: '93',
    })
    expect(results).toBeDefined()
    expect(results).toHaveLength(csvFileDataInJson.length)
    results.forEach((result, index) => {
      expectOneResultWithError(
        result,
        csvFileDataInJson,
        index,
        (dataInJson, i) =>
          "La place n'est pas enregistrée. La place est en dehors de la plage horaire autorisée."
      )
    })
  })
})

describe('Test send mail bordereaux', () => {
  require('../../util/logger').setWithConsole(true)

  const candidats = [
    {
      codeNeph: '123456789001',
      nomNaissance: 'CANDIDAT',
      prenom: 'CANDIDAT',
      email: 'testbordereaux1@test.com',
      portable: '0612345678',
      adresse: '10 Rue Oberkampf 75011 Paris',
      dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
      isValidatedByAurige: true,
      isValidatedEmail: true,
    },
    {
      codeNeph: '123456789002',
      nomNaissance: 'CANDIDAT2',
      prenom: 'CANDIDAT2',
      email: 'testbordereaux2@test.com',
      portable: '0612345678',
      adresse: '10 Rue Oberkampf 75011 Paris',
      dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
      isValidatedByAurige: true,
      isValidatedEmail: true,
    },
  ]

  const centres = [
    {
      departement: '93',
      nom: 'Villepinte',
      adresse:
        'avenue Jean Fourgeaud (dernier parking circulaire) 93420 Villepinte',
      lat: '48.962099',
      label: "Centre d'examen du permis de conduire de Villepinte",
      lon: '2.552847',
    },
    {
      departement: '75',
      nom: 'Noisy le Grand',
      adresse:
        '5 boulevard de Champs Richardets (parking du gymnase de la butte verte) 93160 Noisy le Grand',
      lat: '48.837378',
      label: "Centre d'examen du permis de conduire de Noisy le Grand",
      lon: '2.579699',
    },
  ]

  const inspecteurs = [
    {
      email: 'dupont.jacques@email.fr',
      nom: 'DUPONT',
      prenom: 'jacques',
      matricule: '01020304',
      departement: '93',
    },
    {
      email: 'dupontdu75.jean@email.fr',
      nom: 'DUPONTDU75',
      prenom: 'Jean',
      matricule: '01020375',
      departement: '75',
    },
  ]

  const emailDepartement = 'email93@departement.com'

  let candidatsCreated
  let centresCreated
  let inspecteursCreated
  let placesBooked
  let placesCreated
  const date = commonBasePlaceDateTime.toISO()
  const dateToString = getFrenchFormattedDateTime(date).date

  beforeAll(async () => {
    // Connecter à la base
    await connect()
    // Démarer mailhog
    // Créer 2 inspecteurs dans 2 départements
    try {
      centresCreated = await Promise.all(
        centres.map(centre =>
          createCentre(
            centre.nom,
            centre.label,
            centre.adresse,
            centre.lon,
            centre.lat,
            centre.departement
          )
        )
      )

      inspecteursCreated = await Promise.all(
        inspecteurs.map(inspecteur => createInspecteur(inspecteur))
      )

      placesCreated = await Promise.all(
        inspecteursCreated.map((inspecteur, index) => {
          return createPlace({
            date,
            centre: centresCreated[index]._id,
            inspecteur: inspecteur._id,
          })
        })
      )

      candidatsCreated = await Promise.all(
        candidats.map(candidat => createCandidatAndUpdate(candidat))
      )

      placesBooked = await Promise.all(
        placesCreated.map((place, index) =>
          bookCandidatOnSelectedPlace(place, candidatsCreated[index], bookedAt)
        )
      )
    } catch (e) {
      console.warn(e)
    }
    // Créer 2 délégués avec les 2 mêmes départements
  })

  afterEach(async () => {
    require('../business/send-mail').deleteMails()
  })

  afterAll(async () => {
    // Supprimer les inspecteurs, délégués
    // Se déconnecter
    await disconnect()
    // Arrêter mailhog
  })

  it("Test envoi borderaux aux inspecteurs d'un département", async () => {
    // Given

    // When
    const result = await sendMailSchedulesInspecteurs(
      emailDepartement,
      '93',
      date,
      true
    )

    // Then
    expect(result).toBeDefined()
    expect(result).toHaveProperty('success', true)

    const mails = require('../business/send-mail').getMails()
    expect(mails).toBeDefined()
    expect(mails).toHaveLength(1)

    const mail = mails[0]

    expect(mail).toBeDefined()
    expect(mail).toHaveProperty('to', inspecteurs[0].email)
    expect(mail).toHaveProperty(
      'subject',
      `Bordereau de l'inspecteur ${inspecteurs[0].nom}/${inspecteurs[0].matricule} pour le ${dateToString} au centre de ${centres[0].nom} du département ${centres[0].departement}`
    )
    expect(mail).toHaveProperty(
      'html',
      await getScheduleInspecteurBody(
        inspecteurs[0].nom,
        inspecteurs[0].matricule,
        dateToString,
        centres[0].nom,
        centres[0].departement,
        [placesBooked[0]]
      )
    )
  })

  it("Test envoi borderaux à l'adresse d'un département", async () => {
    // Given

    // When
    const result = await sendMailSchedulesInspecteurs(
      emailDepartement,
      '93',
      date,
      false
    )

    // Then
    expect(result).toBeDefined()
    expect(result).toHaveProperty('success', true)

    const mails = require('../business/send-mail').getMails()
    expect(mails).toBeDefined()
    expect(mails).toHaveLength(1)

    const mail = mails[0]

    expect(mail).toBeDefined()
    expect(mail).toHaveProperty('to', emailDepartement)
    expect(mail).toHaveProperty(
      'subject',
      `Bordereau de l'inspecteur ${inspecteurs[0].nom}/${inspecteurs[0].matricule} pour le ${dateToString} au centre de ${centres[0].nom} du département ${centres[0].departement}`
    )
    expect(mail).toHaveProperty(
      'html',
      await getScheduleInspecteurBody(
        inspecteurs[0].nom,
        inspecteurs[0].matricule,
        dateToString,
        centres[0].nom,
        centres[0].departement,
        [placesBooked[0]]
      )
    )
  })

  it('Test envoi borderaux tous les inspecteurs', async () => {
    // Given

    // When
    const result = await sendMailSchedulesAllInspecteurs(
      commonBasePlaceDateTime.toISO()
    )

    // Then
    expect(result).toBeDefined()
    expect(result).toHaveProperty('success', true)
    expect(result).toHaveProperty('results')

    const mails = require('../business/send-mail').getMails()
    expect(mails).toBeDefined()
    expect(mails).toHaveLength(2)

    const mail1 = mails.find(mail => mail.to === inspecteurs[0].email)
    expect(mail1).toBeDefined()
    expect(mail1).toHaveProperty('to', inspecteurs[0].email)
    expect(mail1).toHaveProperty(
      'subject',
      `Bordereau de l'inspecteur ${inspecteurs[0].nom}/${inspecteurs[0].matricule} pour le ${dateToString} au centre de ${centres[0].nom} du département ${centres[0].departement}`
    )
    expect(mail1).toHaveProperty(
      'html',
      await getScheduleInspecteurBody(
        inspecteurs[0].nom,
        inspecteurs[0].matricule,
        dateToString,
        centres[0].nom,
        centres[0].departement,
        [placesBooked[0]]
      )
    )

    const mail2 = mails.find(mail => mail.to === inspecteurs[1].email)
    expect(mail2).toBeDefined()
    expect(mail2).toHaveProperty('to', inspecteurs[1].email)
    expect(mail2).toHaveProperty(
      'subject',
      `Bordereau de l'inspecteur ${inspecteurs[1].nom}/${inspecteurs[1].matricule} pour le ${dateToString} au centre de ${centres[1].nom} du département ${centres[1].departement}`
    )
    expect(mail2).toHaveProperty(
      'html',
      await getScheduleInspecteurBody(
        inspecteurs[1].nom,
        inspecteurs[1].matricule,
        dateToString,
        centres[1].nom,
        centres[1].departement,
        [placesBooked[1]]
      )
    )
  })
})
