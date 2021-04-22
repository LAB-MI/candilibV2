import { connect, disconnect } from '../../mongo-connection'
import archivedCandidatStatusModel from '../archived-candidat-status/archived-candidat-status-model'
import { generateCandidats } from '../__tests__'
import {
  sortCandilibStatus,
  createCandidat,
  countCandidatsByStatus,
  deleteCandidat,
} from './candidat.queries'

describe('Candidat', () => {
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  it('sort status candidats', async () => {
    const sortableCandidat = {
      nbCandidats: 7,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: null,
      canAccessAt: null,
      token: true,
    }
    const sortableCandidatCanBookInPast = {
      nbCandidats: 1,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: 'past',
      canAccessAt: null,
      token: true,
    }
    const notSortableCandidatCanBookInFuture = {
      nbCandidats: 1,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: 'future',
      canAccessAt: null,
      token: true,
    }
    const sortableCandidatCanAccessInFuture = {
      nbCandidats: 1,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: null,
      canAccessAt: 'future',
      token: true,
    }
    const notSortableCandidatwithNothing = {
      nbCandidats: 1,
      isValidateAurige: false,
      isValideEmail: true,
      canBookFrom: null,
      canAccessAt: null,
      token: false,
    }

    const notSortableCandidatwithoutToken = {
      nbCandidats: 1,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: null,
      canAccessAt: null,
      token: false,
    }

    const allTest = [
      sortableCandidat,
      sortableCandidatCanBookInPast,
      notSortableCandidatCanBookInFuture,
      sortableCandidatCanAccessInFuture,
      notSortableCandidatwithNothing,
      notSortableCandidatwithoutToken,
    ]

    const data = await generateCandidats(allTest)

    const createdCandidat = await Promise.all(data.map(
      el => {
        return createCandidat(el)
      },
    ))

    await sortCandilibStatus()

    const expectedCandidatByStatus = ['1', '1', '1', '1', '1', '6']
    await Promise.all(expectedCandidatByStatus.map(
      async (el, index) => {
        const status = `${index}`
        const countCandidatByStatusValue = await countCandidatsByStatus(status)
        expect(countCandidatByStatusValue).toBe(Number(el))
        // For archived candidat Status
        const archivedStatus = await archivedCandidatStatusModel.countDocuments({ status })
        // console.log({countCandidatByStatusValue, el, status, archivedStatus})
        expect(archivedStatus).toBe(Number(el))
        return countCandidatByStatusValue
      },
    ))

    await Promise.all(createdCandidat.map(candidat => deleteCandidat(candidat).catch(() => true)))
  })
})
