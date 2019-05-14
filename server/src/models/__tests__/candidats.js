import { createCandidat, updateCandidatById } from '../candidat'
import candidatModel from '../candidat/candidat.model'
import { DateTime } from 'luxon'

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

export const candidats2 = [
  {
    codeNeph: '123456789003',
    nomNaissance: 'nom à tester 4',
    prenom: 'prénom à tester n°4',
    email: 'test4.test@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
    dateReussiteETG: DateTime.local().plus({ year: -1 }),
    isValidatedByAurige: true,
  },
  {
    codeNeph: '123456789004',
    nomNaissance: 'nom à tester 5',
    prenom: 'prénom à tester n°5',
    email: 'test5.test@test.com',
    portable: '0612355678',
    adresse: '10 Rue Oberkampf 75011 Paris',
    dateReussiteETG: DateTime.local().plus({ year: -5, day: -1 }),
  },
  {
    codeNeph: '123456789006',
    nomNaissance: 'nom à tester 6',
    prenom: 'prénom à tester n°6',
    email: 'test6.test@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
    dateReussiteETG: DateTime.local().plus({ year: -1 }),
    isValidatedByAurige: true,
  },
]

export const createCandidats = async () => {
  return Promise.all(candidats.map(candidat => createCandidat(candidat)))
}

export const createCandidatsAndUpdate = async () => {
  const newCandidats = await Promise.all(
    candidats2.map(candidat => createCandidat(candidat))
  )
  return Promise.all(
    newCandidats.map(candidat =>
      updateCandidatById(candidat._id, {
        $set: { dateReussiteETG: DateTime.local().plus({ year: -1 }) },
      })
    )
  )
}

export const deleteCandidats = async () => {
  await candidatModel.deleteMany({})
}
