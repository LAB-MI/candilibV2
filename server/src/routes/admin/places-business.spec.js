import { DateTime } from 'luxon'
import { connect, disconnect } from '../../mongo-connection'
import { importPlacesCsv } from './places-business'
import { createCentre } from '../../models/centre'
import { createInspecteur } from '../../models/inspecteur'
import { FRENCH_LOCALE_INFO } from '../../util'

jest.mock('../../util/logger')

const centre = {
  departement: '93',
  nom: 'Villepinte',
  adresse:
    'avenue Jean Fourgeaud (dernier parking circulaire) 93420 Villepinte',
  lat: '48.962099',
  label: "Centre d'examen du permis de conduire de Villepinte",
  lon: '2.552847',
}

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

  it('should have errors with fields are missing ', async () => {
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

  it('should have errors with departements are different ', async () => {
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

  it('should have errors with centres are unknown ', async () => {
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

  it('should have errors with inspecteurs are unknown', async () => {
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

  it('should have errors with name inspecteurs are differents', async () => {
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

  it('should no create same places ', async () => {
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
