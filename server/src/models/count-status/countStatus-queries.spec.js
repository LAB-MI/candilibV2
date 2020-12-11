import { connect, disconnect } from '../../mongo-connection'
import { getFrenchLuxon } from '../../util'

import countStatusModel from './countStatus-model'
import { createCountStatus, createManyCountStatus, findCountStatus } from './countStatus-queries'

describe('CountStatus', () => {
  const dataToTests = () => {
    const date = getFrenchLuxon().minus({ months: 1 })
    const dates = [date.startOf('week'), date.endOf('week')]

    const statuses = dates.map((date, index) => ({
      departement: '93',
      candidatStatus: `${2 + index}`,
      count: 1000 * (index + 1),
      createdAt: date,
    }))
    return { statuses, dates }
  }

  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  it('should create countStatus', async () => {
    const departement = '93'
    const statusCandidat = '3'
    const count = 1000

    await createCountStatus(departement, statusCandidat, count)

    const status = await countStatusModel.find()

    expect(status).toBeDefined()
    expect(status).toHaveLength(1)
    expect(status[0]).toHaveProperty('departement', departement)
    expect(status[0]).toHaveProperty('candidatStatus', statusCandidat)
    expect(status[0]).toHaveProperty('count', count)

    await countStatusModel.deleteMany()
  })

  it('should find 2 countStatues', async () => {
    const { statuses, dates } = dataToTests()

    await Promise.all(statuses.map(async (element) => {
      const { departement, candidatStatus, count, createdAt } = element
      return createCountStatus(departement, candidatStatus, count, createdAt)
    }))

    const statusesFound = await findCountStatus(dates[0].startOf('day').toISO(), dates[1].endOf('day').toISO(), statuses[0].departement)
    expect(statusesFound).toHaveLength(statuses.length)

    await countStatusModel.deleteMany()
  })

  it('Should create many documents countStatus', async () => {
    const { statuses, dates } = dataToTests()
    await createManyCountStatus(statuses)
    const statusesFound = await findCountStatus(dates[0].startOf('day'), dates[1].endOf('day'), statuses[0].departement)
    expect(statusesFound).toHaveLength(statuses.length)
    await countStatusModel.deleteMany()
  })
})
