import { createCandidat } from '../../models/candidat'
import candidatModel from '../../models/candidat/candidat.model'
import countStatusModel from '../../models/count-status/countStatus-model'

import { generateCandidats } from '../../models/__tests__'
import { connect, disconnect } from '../../mongo-connection'
import { sortStatus } from './sort-candidat-status-business'
jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)

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
      token: true,
      lastConnection: true,
    }, {
      nbCandidats: 5,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: null,
      canAccessAt: null,
      departement: '93',
      token: true,
      lastConnection: true,
    }, {
      nbCandidats: 3,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: null,
      canAccessAt: null,
      departement: '92',
      token: true,
      lastConnection: true,
    }, {
      nbCandidats: 3,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: null,
      canAccessAt: null,
      departement: '93',
      homeDepartement: '75',
      token: true,
      lastConnection: true,
    },
    ]

    const data = await generateCandidats(sortableCandidat)

    await Promise.all(data.map(el => createCandidat(el)))
  })

  afterAll(async () => {
    await disconnect()
  })

  // TODO: Ajouter fixer nombre de candidat par groupe
  it('Should have n candidats in countStatus', async () => {
    await sortStatus({ nbDaysInactivityNeeded: 0 })
    for (let i = 0; i < 6; i++) {
      for (const departement of ['92', '93', '95', '75']) {
        const count = await candidatModel.countDocuments({ status: `${i}`, homeDepartement: `${departement}` })
        const countFromCountStatus = await countStatusModel.find({ candidatStatus: `${i}`, departement })
        expect(countFromCountStatus).toBeDefined()
        if (!count) {
          expect(countFromCountStatus[0]).toBeUndefined()
          continue
        }
        expect(countFromCountStatus).toHaveLength(1)
        expect(countFromCountStatus[0].count).toBe(count)
      }
    }
  })
})
