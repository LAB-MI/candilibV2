import { createCandidat } from '../../models/candidat'
import candidatModel from '../../models/candidat/candidat.model'
import countStatusModel from '../../models/count-status/countStatus-model'

import { generateCandidats } from '../../models/__tests__'
import { connect, disconnect } from '../../mongo-connection'
import { sortStatus } from './sort-candidat-status-business'
jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(true)

describe('Candidats group by status', () => {
  beforeAll(async () => {
    await connect()
    const sortableCandidat = [{
      nbCandidats: 6,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: null,
      canAccessAt: null,
      departement: '95',
    }, {
      nbCandidats: 5,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: null,
      canAccessAt: null,
      departement: '93',
    }, {
      nbCandidats: 3,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: null,
      canAccessAt: null,
      departement: '92',
    }]

    const data = await generateCandidats(sortableCandidat)

    await Promise.all(data.map(el => createCandidat(el)))
  })

  afterAll(async () => {
    await disconnect()
  })

  it('Should have n candidats in countStatus', async () => {
    await sortStatus()
    for (let i = 0; i < 6; i++) {
      for (const departement of ['92', '93', '95']) {
        const count = await candidatModel.countDocuments({ status: `${i}`, departement })
        const countFromCountStatus = await countStatusModel.find({ candidatStatus: `${i}`, departement })

        count ? expect(countFromCountStatus[0].count).toBe(count)
          : expect(countFromCountStatus[0]).toBeUndefined()
      }
    }
  })
})
