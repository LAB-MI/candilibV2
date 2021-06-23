import { getFrenchLuxon } from '../../util'
import { createCandidat } from '../candidat'
import candidatModel from '../candidat/candidat.model'

import faker from 'faker/locale/fr'

export const generateCandidats = (params) => {
  const users = []

  params.forEach(item => {
    const {
      nbCandidats,
      isValidateAurige,
      isValideEmail,
      canBookFrom,
      canAccessAt,
      departement,
      homeDepartement,
      token,
      lastConnection,
    } = item

    for (let id = 1; id <= nbCandidats; id++) {
      const codeNeph = `123${id}456789000`
      const nomNaissance = faker.name.lastName()
      const prenom = faker.name.firstName()
      const email = faker.internet.email()
      const portable = `06${faker.phone.phoneNumberFormat().slice(2)}`
      const adresse = faker.address.streetAddress()
      const dept2Digit = faker.address.zipCode()
      const dept = departement || `${dept2Digit[0]}${dept2Digit[1]}`
      const creatdAt = faker.date.past()

      const userData = {
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
        departement: dept,
        dateReussiteETG: getFrenchLuxon().plus({ year: -1 }).toISO(),
        isValidatedByAurige: isValidateAurige,
        isValidatedEmail: isValideEmail,
        createdAt: creatdAt,
        homeDepartement,
        lastConnection,
      }

      if (canBookFrom) {
        if (canBookFrom === 'past') {
          userData.canBookFrom = faker.date.past()
        }
        if (canBookFrom === 'future') {
          userData.canBookFrom = faker.date.future()
        }
      }

      if (canAccessAt) {
        if (canAccessAt === 'past') {
          userData.canAccessAt = faker.date.past()
        }
        if (canAccessAt === 'future') {
          userData.canAccessAt = faker.date.future()
        }
      }

      if (token) {
        userData.token = 'fake_token_valide'
      }

      users.push(userData)
    }
  })

  return users
}

export const candidats = [
  {
    codeNeph: '123456789000',
    nomNaissance: 'Nom à tester',
    prenom: 'Prénom à tester n°1',
    email: 'test1.test@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
    departement: '93',
    status: '1',
  },
  {
    codeNeph: '123456789001',
    nomNaissance: 'Nom à tester',
    prenom: 'Prénom à tester n°2',
    email: 'test2.test@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
    departement: '93',
    status: '2',
  },
  {
    codeNeph: '123456789002',
    nomNaissance: 'nom à tester',
    prenom: 'prénom à tester n°3',
    email: 'test3.test@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
    departement: '93',
    status: '3',
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
    departement: '00',
    dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
    isValidatedByAurige: true,
    isValidatedEmail: true,
    status: '1',
  },
  {
    codeNeph: '123456789004',
    nomNaissance: 'nom à tester 5',
    prenom: 'prénom à tester n°5',
    email: 'test5.test@test.com',
    portable: '0612355678',
    adresse: '10 Rue Oberkampf 75011 Paris',
    departement: '00',
    dateReussiteETG: getFrenchLuxon().plus({ year: -5, day: -1 }),
    isValidatedByAurige: true,
    isValidatedEmail: true,
    status: '2',
  },
  {
    codeNeph: '123456789006',
    nomNaissance: 'nom à tester 6',
    prenom: 'prénom à tester n°6',
    email: 'test6.test@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
    departement: '00',
    dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
    isValidatedByAurige: true,
    isValidatedEmail: true,
    status: '3',
  },
  {
    codeNeph: '123456789007',
    nomNaissance: 'nom à tester 7',
    prenom: 'prénom à tester n°7',
    email: 'test7.test@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
    departement: '00',
    dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
    isValidatedByAurige: false,
    isValidatedEmail: true,
    status: '4',
  },
]

export const createCandidats = async () => {
  return Promise.all(candidats.map(candidat => createCandidat(candidat)))
}

export const createCandidatsAndUpdate = async () => {
  const newCandidats = await Promise.all(
    candidats2.map(async candidat => {
      const __candidat = await createCandidat(candidat)
      __candidat.dateReussiteETG = candidat.dateReussiteETG
      __candidat.isValidatedByAurige = candidat.isValidatedByAurige
      __candidat.isValidatedEmail = candidat.isValidatedEmail
      const __candidat1 = await __candidat.save()

      return __candidat1
    }),
  )

  return newCandidats
}

export const createCandidatAndUpdate = async (candidat, canAccessAt = null) => {
  const createdCandidat = await createCandidat(candidat)
  createdCandidat.dateReussiteETG = getFrenchLuxon().plus({ year: -1 })
  createdCandidat.isValidatedByAurige = true
  createdCandidat.isValidatedEmail = true
  if (canAccessAt) {
    createdCandidat.canAccessAt = canAccessAt
  }
  const updatedCandidat = await createdCandidat.save()
  return updatedCandidat
}

export const deleteCandidats = async () => {
  await candidatModel.deleteMany({})
}
