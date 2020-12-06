import { getFrenchLuxon } from '../../util'
import { getLogsByFilters } from './logs-candidat-business'
import { saveManyLogActionsCandidat } from '../../models/logs/logs-queries'
import LogsModel from '../../models/logs/logs-model'
import { connect, disconnect } from '../../mongo-connection'

describe('Test logs candidat', () => {
  beforeAll(async () => {
    await connect()
  })
  afterAll(async () => {
    await LogsModel.deleteMany({ type: 'logs-requests' })
    await disconnect()
  })
  it('shoud create and get logs candidats', async () => {
    const beginAt = getFrenchLuxon().startOf('day').plus({ hours: 2 })
    const savedAt = getFrenchLuxon().startOf('day').plus({ hours: 4 })
    const type = 'logs-requests'
    const fakeLog = {
      type,
      content: '',
      beginAt: beginAt.toISO(),
      savedAt: savedAt.toISO(),
    }

    const modification = 'MODIFICATION'
    const removed = 'REMOVED'
    const reservation = 'RESERVATION'
    const template = {
      logs: {
        [modification]: 1,
        [removed]: 1,
        [reservation]: 1,
      },
    }
    const statusTemplate = {
      0: template,
      1: template,
      2: template,
      3: template,
      4: template,
      5: template,
    }
    const resultlogsTemplate = {
      0: { MODIFICATION: 2, REMOVED: 2, RESERVATION: 2 },
      1: { MODIFICATION: 2, REMOVED: 2, RESERVATION: 2 },
      2: { MODIFICATION: 2, REMOVED: 2, RESERVATION: 2 },
      3: { MODIFICATION: 2, REMOVED: 2, RESERVATION: 2 },
      4: { MODIFICATION: 2, REMOVED: 2, RESERVATION: 2 },
      5: { MODIFICATION: 2, REMOVED: 2, RESERVATION: 2 },
    }
    const dptInitial = 89
    const nbDptNeed = 10
    const formatedData = Array(nbDptNeed).fill(true).reduce((acc, _, index) => {
      acc[`${dptInitial + index}`] = statusTemplate
      return acc
    }, {})
    const formatedDataResult = Array(nbDptNeed).fill(true).reduce((acc, _, index) => {
      acc[`${dptInitial + index}`] = resultlogsTemplate
      return acc
    }, {})

    fakeLog.content = JSON.stringify(formatedData)

    await saveManyLogActionsCandidat(fakeLog)
    const result = await saveManyLogActionsCandidat(fakeLog)

    expect(result).toHaveProperty('type', type)
    expect(result).toHaveProperty('content', fakeLog.content)
    expect(result).toHaveProperty('beginAt', beginAt.toJSDate())
    expect(result).toHaveProperty('savedAt', savedAt.toJSDate())

    const resultLogs = await getLogsByFilters({})

    expect(JSON.stringify(resultLogs)).toBe(
      JSON.stringify({
        [`${beginAt.hour}_${savedAt.hour}`]: formatedDataResult,
      }),
    )
  })
})
