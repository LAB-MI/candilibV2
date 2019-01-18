import { connect, disconnect } from '../../mongo-connection'
import { deletePlace, createPlace, findAllPlaces } from '../place'
import moment from 'moment'
import { createCandidat, findAllCandidatsLean } from './candidat.queries'
import { deleteCandidat } from '../../routes/admin/whitelisted.controllers'
import { findBookedCandidats } from './booked.candidat.queries'

const candidats = [
  {
    codeNeph: '123456789000',
    nomNaissance: 'Nom à tester',
    prenom: 'Prénom à tester n°1',
    email: 'test1.test@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
  },
  {
    codeNeph: '123456789001',
    nomNaissance: 'Nom à tester',
    prenom: 'Prénom à tester n°2',
    email: 'test2.test@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
  },
  {
    codeNeph: '123456789002',
    nomNaissance: 'nom à tester',
    prenom: 'prénom à tester n°3',
    email: 'test3.test@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
  },
]
const places = [
  {
    date: (() =>
      moment()
        .date(28)
        .hour(9)
        .minute(0)
        .second(0)
        .toDate())(),
    centre: 'Nom de centre à tester n°1',
    inspecteur: "Nom de l'inspecteur du centre n°1",
  },
  {
    date: (() =>
      moment()
        .date(29)
        .hour(10)
        .minute(0)
        .second(0)
        .toDate())(),
    centre: 'Nom de centre à tester n°2',
    inspecteur: "Nom de l'inspecteur du centre n°2",
  },
  {
    date: (() =>
      moment()
        .date(28)
        .hour(11)
        .minute(0)
        .second(0)
        .toDate())(),
    centre: 'Nom de centre à tester n°3',
    inspecteur: "Nom de l'inspecteur du centre n°3",
  },
]

const createCandidats = async () => {
  return Promise.all(candidats.map(candidat => createCandidat(candidat)))
}

const createPlaces = async () => {
  return Promise.all(places.map(place => createPlace(place)))
}

const makeResa = (place, candidat) => {
  return place.update({ bookedBy: candidat._id })
}

const makeResas = async () => {
  const placesDb = (await findAllPlaces()).sort((a, b) =>
    a.centre.localeCompare(b.centre)
  )
  const candidatsDb = (await findAllCandidatsLean()).sort((a, b) =>
    a.codeNeph.localeCompare(b.codeNeph)
  )
  return Promise.all([
    makeResa(placesDb[0], candidatsDb[0]),
    makeResa(placesDb[1], candidatsDb[1]),
  ])
}

describe('Booked Candidat', () => {
  beforeAll(async () => {
    await connect()
    await createCandidats()
    await createPlaces()
    await makeResas()
  })

  afterAll(async () => {
    const placesDb = await findAllPlaces()
    const candidatsDb = await findAllCandidatsLean()
    await Promise.all(placesDb.map(place => deletePlace(place)))
    await Promise.all(candidatsDb.map(candidat => deleteCandidat(candidat)))
    await disconnect()
  })

  it('Get the booked candidats ', async () => {
    const bookedCandidats = await findBookedCandidats()
    expect(bookedCandidats.length).toBe(2)
    bookedCandidats.forEach(candidat => {
      expect(candidat.place).toBeDefined()
      expect(candidat.place.centre).toBeDefined()
    })
  })
  it('Get the booked candidats by date ', async () => {
    const date = moment().date(28)

    const bookedCandidats = await findBookedCandidats(date)
    expect(bookedCandidats.length).toBe(1)
    bookedCandidats.forEach(candidat => {
      expect(candidat.place).toBeDefined()
      expect(candidat.place.centre).toBeDefined()
    })
  })
  it('Get the booked candidats by centre', async () => {
    const centre = 'Nom de centre à tester n°2'
    const bookedCandidats = await findBookedCandidats(
      undefined,
      undefined,
      centre
    )
    expect(bookedCandidats.length).toBe(1)
    bookedCandidats.forEach(candidat => {
      expect(candidat.place).toBeDefined()
      expect(candidat.place.centre).toBe(centre)
    })
  })
  it('Get the booked candidats inspecteur', async () => {
    const inspecteur = "Nom de l'inspecteur du centre n°1"
    const bookedCandidats = await findBookedCandidats(
      undefined,

      inspecteur
    )
    expect(bookedCandidats.length).toBe(1)
    bookedCandidats.forEach(candidat => {
      expect(candidat.place).toBeDefined()
      expect(candidat.place.inspecteur).toBe(inspecteur)
    })
  })
})
