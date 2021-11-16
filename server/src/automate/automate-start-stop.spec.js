import { findStatusByType, upsertStatusByType } from '../models/status/status.queries.js'
import startScheduler, { getIntanceAgenda, isAgendaStarted, graceful, startAgendaAndJobs, stopAgenda, isReadyToOnAir } from './automate.js'

jest.mock('../util/logger')
require('../util/logger').setWithConsole(false)

jest.mock('./config', () => {
  return () => ({
    jobs: {
      schedule: true,
      define: false,
    },
    db: {
      agendaCollectionName: 'testCollection',
    },
    scheduler: {
      schedulerName: 'test_schedulename',
    },
    TENANT_NAME: 'hostname_test',
  })
})

describe('Test start and stop Automate', () => {
  beforeAll(async () => {
    await startScheduler()
  })

  afterAll(async () => {
    await graceful()
  })
  it('should start and stop agenda', async () => {
    expect(isAgendaStarted()).toBeUndefined()
    expect(getIntanceAgenda()).toBeDefined()
    await startAgendaAndJobs([])
    expect(isAgendaStarted()).toBe(true)
    const statusFromDB = await findStatusByType({ type: 'TENANT_NAME' })
    expect(statusFromDB).toHaveProperty('message', 'hostname_test')
    await stopAgenda()
    expect(isAgendaStarted()).toBe(false)
  })

  it('should is not active', async () => {
    await upsertStatusByType({ type: 'TENANT_NAME', message: 'test_tmp' })
    const isOk = await isReadyToOnAir()
    expect(isOk).toBe(false)
  })

  it('should is active', async () => {
    await upsertStatusByType({ type: 'TENANT_NAME', message: 'hostname_test' })
    const isOk = await isReadyToOnAir()
    expect(isOk).toBe(true)
  })
})
