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
    }
    const sortableCandidatCanBookInPast = {
      nbCandidats: 1,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: 'past',
      canAccessAt: null,
    }
    const notSortableCandidatCanBookInFuture = {
      nbCandidats: 1,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: 'future',
      canAccessAt: null,
    }
    const sortableCandidatCanAccessInFuture = {
      nbCandidats: 1,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: null,
      canAccessAt: 'future',
    }
    const notSortableCandidatwithNothing = {
      nbCandidats: 1,
      isValidateAurige: false,
      isValideEmail: true,
      canBookFrom: null,
      canAccessAt: null,
    }

    const allTest = [
      sortableCandidat,
      sortableCandidatCanBookInPast,
      notSortableCandidatCanBookInFuture,
      sortableCandidatCanAccessInFuture,
      notSortableCandidatwithNothing,
    ]
    const data = await generateCandidats(allTest)

    const createdCandidat = await Promise.all(data.map(
      el => {
        return createCandidat(el)
      },
    ))

    await sortCandilibStatus()

    const expectedCandidatByStatus = ['1', '1', '1', '1', '1', '5']
    await Promise.all(expectedCandidatByStatus.map(
      async (el, index) => {
        const status = `${index}`
        const countStatus = await countCandidatsByStatus(status)
        expect(countStatus).toBe(Number(el))
        // For archived candidat Status
        const archivedStatus = await archivedCandidatStatusModel.countDocuments({ status })
        expect(archivedStatus).toBe(Number(el))
        return countStatus
      },
    ))

    await Promise.all(createdCandidat.map(candidat => deleteCandidat(candidat).catch(() => true)))
  })
})
