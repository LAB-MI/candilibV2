import { connect, disconnect } from '../../mongo-connection'
import archivedCandidatStatusModel from '../archived-candidat-status/archived-candidat-status-model'
import { deleteCandidats, generateCandidats } from '../__tests__'
import {
  sortCandilibStatus,
  createCandidat,
  countCandidatsByStatus,
  getOrUpsertNbDaysInactivity,
} from './candidat.queries'

import { getFrenchLuxon } from '../../util'
import { NbDaysInactivityDefault, NB_DAYS_INACTIVITY } from '../../config'
import { createStatus, deleteStatusByType, findStatusByType } from '../status'
import candidatModel from './candidat.model'
import { STATUS_CANDIDAT_NO_ACTIF, STATUS_CANDIDAT_OTHER, STATUS_CANDIDAT_PENALTY } from './candidat-reason-status'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)

describe('Candidat status', () => {
  let sortableInactiveCandidat
  let allTest
  const now = getFrenchLuxon()

  beforeAll(async () => {
    await connect()

    // const dayAfterIncative = now.minus({ days: nbDaysInactivity })
    // const dayBeforeIncative = now.minus({ days: nbDaysInactivity + 1 })
    const dayAfterIncative = now.minus({ days: NbDaysInactivityDefault })
    const dayBeforeIncative = now.minus({ days: NbDaysInactivityDefault + 1 })

    const sortableCandidat = {
      nbCandidats: 7,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: null,
      canAccessAt: null,
      token: true,
      lastConnection: dayAfterIncative.toJSDate(),
      firstName: 'Sortable',
      reasonStatus: null,
    }
    const sortableCandidatCanBookInPast = {
      nbCandidats: 1,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: 'past',
      canAccessAt: null,
      token: true,
      lastConnection: dayAfterIncative.toJSDate(),
      firstName: 'canBooking',
      reasonStatus: null,
    }
    const notSortableCandidatCanBookInFuture = {
      nbCandidats: 1,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: 'future',
      canAccessAt: null,
      token: true,
      lastConnection: dayAfterIncative.toJSDate(),
      firstName: 'cannotBooking',
      reasonStatus: STATUS_CANDIDAT_PENALTY,
    }
    const sortableCandidatCanAccessInFuture = {
      nbCandidats: 1,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: null,
      canAccessAt: 'future',
      token: true,
      lastConnection: dayAfterIncative.toJSDate(),
      firstName: 'noAccess',
      reasonStatus: STATUS_CANDIDAT_OTHER,
    }
    const notSortableCandidatwithNothing = {
      nbCandidats: 1,
      isValidateAurige: false,
      isValideEmail: true,
      canBookFrom: null,
      canAccessAt: null,
      token: false,
      firstName: 'noAurige',
    }

    const notSortableCandidatwithoutToken = {
      nbCandidats: 1,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: null,
      canAccessAt: null,
      token: false,
      firstName: 'withoutToken',
      reasonStatus: STATUS_CANDIDAT_OTHER,
    }
    sortableInactiveCandidat = {
      nbCandidats: 7,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: null,
      canAccessAt: null,
      token: true,
      lastConnection: dayBeforeIncative.toJSDate(),
      firstName: 'inactive',
      reasonStatus: STATUS_CANDIDAT_NO_ACTIF,
    }

    allTest = [
      sortableCandidat,
      sortableCandidatCanBookInPast,
      notSortableCandidatCanBookInFuture,
      sortableCandidatCanAccessInFuture,
      notSortableCandidatwithNothing,
      notSortableCandidatwithoutToken,
      sortableInactiveCandidat,
    ]

    const data = await generateCandidats(allTest)

    await Promise.all(data.map(
      el => {
        return createCandidat(el)
      },
    ))
  })

  afterAll(async () => {
    await deleteCandidats()
    await disconnect()
  })

  afterEach(async () => {
    const nbDaysFoundInDb = await findStatusByType({ type: NB_DAYS_INACTIVITY })
    if (nbDaysFoundInDb) {
      await deleteStatusByType(NB_DAYS_INACTIVITY)
    }
  })

  it.each([
    undefined,
    0,
    60,
    90,
  ])('get %i number days inactive', async (nbDaysexpected) => {
    const nbDaysFound = await getOrUpsertNbDaysInactivity({ nbDaysInactivityNeeded: nbDaysexpected })
    expect(nbDaysFound).toBe(nbDaysexpected || 60)
    const nbDaysFoundInDb = await findStatusByType({ type: NB_DAYS_INACTIVITY })
    if (nbDaysexpected) {
      expect(nbDaysFoundInDb).toHaveProperty('message', `${nbDaysexpected}`)
      await deleteStatusByType(NB_DAYS_INACTIVITY)
    } else {
      expect(nbDaysFoundInDb).toBeNull()
    }
  })

  it.each`
      nbDaysInactivity                | nbDaysInactivityToSet           | formInitDb
      ${NbDaysInactivityDefault}      | ${0}                            | ${undefined}
      ${NbDaysInactivityDefault + 30} | ${NbDaysInactivityDefault + 30} | ${undefined}
      ${NbDaysInactivityDefault + 30} | ${0}                            | ${NbDaysInactivityDefault + 30}
    `('sort status candidats with $nbDaysInactivity days inactives and with a set $nbDaysInactivityToSet days', ({ nbDaysInactivity, nbDaysInactivityToSet, formInitDb }, done) => {
    testSortCandidats(nbDaysInactivity, nbDaysInactivityToSet, formInitDb).catch((error) => {
      throw error
    }).finally(() => {
      done()
    })
  })

  async function runSortCandidats (nbDaysInactivity, formInitDb, nbDaysInactivityToSet) {
    const dayBeforeIncative = now.minus({ days: nbDaysInactivity + 1 })
    await candidatModel.updateMany({ prenom: /inactive/ }, { lastConnection: dayBeforeIncative.toJSDate() })
    formInitDb && await createStatus({ type: NB_DAYS_INACTIVITY, message: `${formInitDb}` })

    await sortCandilibStatus({ nbDaysInactivityNeeded: nbDaysInactivityToSet })
  }

  async function testSortCandidats (nbDaysInactivity, nbDaysInactivityToSet, formInitDb) {
    await runSortCandidats(nbDaysInactivity, formInitDb, nbDaysInactivityToSet)

    const expectedCandidatByStatus = ['1', '1', '1', '1', '1', `${6 + sortableInactiveCandidat.nbCandidats}`]
    await Promise.all(expectedCandidatByStatus.map(
      async (el, index) => {
        const status = `${index}`
        const countCandidatByStatusValue = await countCandidatsByStatus(status)
        expect(countCandidatByStatusValue).toBe(Number(el))
        // For archived candidat Status
        const archivedStatus = await archivedCandidatStatusModel.countDocuments({ status })
        expect(archivedStatus).toBe(Number(el))
        return countCandidatByStatusValue
      },
    ))

    for (const { firstName, nbCandidats, reasonStatus } of allTest) {
      const candidatsFounds = await candidatModel.find({ prenom: firstName }, { _id: 0, prenom: 1, reasonStatus: 1 })

      expect(candidatsFounds).toEqual(expect.arrayContaining(
        Array(nbCandidats).fill(expect.objectContaining({ prenom: firstName, reasonStatus: reasonStatus })),
      ))
    }

    const nbDaysFoundInDb = await findStatusByType({ type: NB_DAYS_INACTIVITY })
    if (nbDaysInactivityToSet) {
      expect(nbDaysFoundInDb).toHaveProperty('message', `${nbDaysInactivityToSet}`)
      await deleteStatusByType(NB_DAYS_INACTIVITY)
    } else if (!formInitDb) {
      expect(nbDaysFoundInDb).toBeNull()
    }
  }
})
