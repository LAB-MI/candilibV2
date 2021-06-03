import { connect, disconnect } from '../../mongo-connection'
import { getFrenchLuxon } from '../../util'
import jwt from 'jsonwebtoken'

// import { generateCandidats } from '../__tests__'
import faker from 'faker/locale/fr'
import { deleteCandidats } from '../../models/__tests__/candidats'
import { countLastConnection } from './statistics.business'
import { createCandidat } from '../../models/candidat'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)

const generateCommonInfoCandidat = (id) => {
  return {
    codeNeph: `123${id}456789000`,
    nomNaissance: faker.name.lastName(),
    prenom: faker.name.firstName(),
    email: faker.internet.email(),
    portable: `06${faker.phone.phoneNumberFormat().slice(2)}`,
    departement: `${faker.address.zipCode()}`,
    homeDepartement: `${faker.address.zipCode()}`,
  }
}
describe('Statistique last connection', () => {
  let candidatsTrancheNone
  let candidatsTranche1
  let candidatsTranche2
  let candidatsTranche3
  let candidatsTranche4
  beforeAll(async () => {
    await connect()
    const now = getFrenchLuxon()
    // Candidat dans aucune tranche
    let id = 0
    candidatsTrancheNone = [
      {
        isValidatedByAurige: false,
        ...generateCommonInfoCandidat(id++),
        createdAt: faker.date.past(),
      },
      {
        isValidatedByAurige: true,
        canAccessAt: faker.date.future(),
        ...generateCommonInfoCandidat(id++),
        createdAt: faker.date.past(),
      },
    ]
    // Candidat de la 1er tranche
    candidatsTranche1 = [
      {
        isValidatedByAurige: true,
        ...generateCommonInfoCandidat(id++),
        createdAt: faker.date.past(),
        canAccessAt: faker.date.past(),
        tokenAddedAt: now.minus({ days: 20 }),
      },
      {
        isValidatedByAurige: true,
        ...generateCommonInfoCandidat(id++),
        createdAt: faker.date.past(),
        canAccessAt: faker.date.past(),
        tokenAddedAt: faker.date.past(),
        lastConnection: now.minus({ days: 30 }),
      },
      {
        isValidatedByAurige: true,
        ...generateCommonInfoCandidat(id++),
        createdAt: faker.date.past(),
        canAccessAt: faker.date.past(),
        token: jwt.sign({ iat: now.minus({ days: 59 }).toSeconds() }, 'secret'),
      },
    ]
    // Candidat de la 2er tranche
    candidatsTranche2 = [
      {
        isValidatedByAurige: true,
        ...generateCommonInfoCandidat(id++),
        createdAt: faker.date.past(),
        canAccessAt: faker.date.past(),
        tokenAddedAt: now.minus({ days: 61 }),
      },
      {
        isValidatedByAurige: true,
        ...generateCommonInfoCandidat(id++),
        createdAt: faker.date.past(),
        canAccessAt: faker.date.past(),
        tokenAddedAt: faker.date.past(),
        lastConnection: now.minus({ days: 80 }),
      },
      {
        isValidatedByAurige: true,
        ...generateCommonInfoCandidat(id++),
        createdAt: faker.date.past(),
        canAccessAt: faker.date.past(),
        token: jwt.sign({ iat: now.minus({ days: 89 }).toSeconds() }, 'secret'),
      },
    ]
    // Candidat de la 3er tranche
    candidatsTranche3 = [
      {
        isValidatedByAurige: true,
        ...generateCommonInfoCandidat(id++),
        createdAt: faker.date.past(),
        canAccessAt: faker.date.past(),
        tokenAddedAt: now.minus({ days: 91 }),
      },
      {
        isValidatedByAurige: true,
        ...generateCommonInfoCandidat(id++),
        createdAt: faker.date.past(),
        canAccessAt: faker.date.past(),
        tokenAddedAt: faker.date.past(),
        lastConnection: now.minus({ days: 100 }),
      },
      {
        isValidatedByAurige: true,
        ...generateCommonInfoCandidat(id++),
        createdAt: faker.date.past(),
        canAccessAt: faker.date.past(),
        token: jwt.sign({ iat: now.minus({ days: 119 }).toSeconds() }, 'secret'),
      },
    ]

    candidatsTranche4 = [
      {
        isValidatedByAurige: true,
        ...generateCommonInfoCandidat(id++),
        createdAt: faker.date.past(),
        canAccessAt: faker.date.past(),
        tokenAddedAt: now.minus({ days: 121 }),
      },
      {
        isValidatedByAurige: true,
        ...generateCommonInfoCandidat(id++),
        createdAt: faker.date.past(),
        canAccessAt: faker.date.past(),
        tokenAddedAt: faker.date.past(),
        lastConnection: now.minus({ days: 130 }),
      },
      {
        isValidatedByAurige: true,
        ...generateCommonInfoCandidat(id++),
        createdAt: faker.date.past(),
        canAccessAt: faker.date.past(),
        token: jwt.sign({ iat: now.minus({ days: 121 }).toSeconds() }, 'secret'),
      },
      {
        isValidatedByAurige: true,
        ...generateCommonInfoCandidat(id++),
        createdAt: faker.date.past(),
      },
      {
        isValidatedByAurige: true,
        ...generateCommonInfoCandidat(id++),
        canAccessAt: faker.date.past(),
        createdAt: faker.date.past(),
      },
    ]

    await Promise.all([
      ...candidatsTrancheNone,
      ...candidatsTranche1,
      ...candidatsTranche2,
      ...candidatsTranche3,
      ...candidatsTranche4,
    ].map(createCandidat))
  })

  afterAll(async () => {
    await deleteCandidats()
    await disconnect()
  })

  it('Should have statistique of candidats non connected', async () => {
    const result = await countLastConnection()
    expect(result).toEqual(expect.arrayContaining([candidatsTranche1.length, candidatsTranche2.length, candidatsTranche3.length, candidatsTranche4.length]))
  })
})
