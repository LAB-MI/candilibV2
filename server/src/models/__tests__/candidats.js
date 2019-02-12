import {
  createCandidat,
  findAllCandidatsLean,
  deleteCandidat,
} from '../candidat'

import { createPlace, findAllPlaces, deletePlace } from '../place'
import moment from 'moment'

export const candidats = [
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
export const places = [
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

export const createCandidats = async () => {
  return Promise.all(candidats.map(candidat => createCandidat(candidat)))
}

export const createPlaces = async () => {
  return Promise.all(places.map(place => createPlace(place)))
}

const makeResa = (place, candidat) => {
  return place.update({ bookedBy: candidat._id })
}

export const makeResas = async () => {
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

export const NUMBER_RESA = 2

export const deletePlaces = async () => {
  const placesDb = await findAllPlaces()
  await Promise.all(placesDb.map(place => deletePlace(place)))
}

export const deleteCandidats = async () => {
  const candidatsDb = await findAllCandidatsLean()
  await Promise.all(candidatsDb.map(candidat => deleteCandidat(candidat)))
}
