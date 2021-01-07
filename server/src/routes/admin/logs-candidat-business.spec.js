import { getFrenchLuxon } from '../../util'
import { getLogsByFilters } from './logs-candidat-business'
import { saveManyLogActionsCandidat } from '../../models/logs-candidat/logs-queries'
import LogsModel from '../../models/logs-candidat/logs-model'
import { connect, disconnect } from '../../mongo-connection'
import { logsTypeNameForDepartement } from '../../config'

describe('Test logs candidat', () => {
  beforeAll(async () => {
    await connect()
  })
  afterAll(async () => {
    await LogsModel.deleteMany({ type: logsTypeNameForDepartement })
    await disconnect()
  })

  it('shoud create and get logs candidats', async () => {
    const beginAt = getFrenchLuxon().startOf('day').plus({ hours: 2 })
    const savedAt = getFrenchLuxon().startOf('day').plus({ hours: 4 })
    const type = logsTypeNameForDepartement
    const fakeLog = {
      type,
      content: '',
      beginAt: beginAt.toISO(),
      savedAt: savedAt.toISO(),
    }

    const modification = 'M'
    const removed = 'A'
    const reservation = 'R'
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
      0: { M: 2, A: 2, R: 2 },
      1: { M: 2, A: 2, R: 2 },
      2: { M: 2, A: 2, R: 2 },
      3: { M: 2, A: 2, R: 2 },
      4: { M: 2, A: 2, R: 2 },
      5: { M: 2, A: 2, R: 2 },
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
        [`${beginAt.hour}_${savedAt.hour}_${savedAt.toLocaleString()}`]: formatedDataResult,
      }),
    )
  })
})
