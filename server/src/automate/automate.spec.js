import { upsertStatusByType } from '../models/status'
import { connect } from '../mongo-connection'
import startScheduler, { isAgendaStarted, graceful, stopAgenda } from './automate.js'
import { HELLO_JOB } from './jobs'
import { getConnectDB } from './get-connect-db'
import { wait1s } from './__test__/utils'

jest.mock('../util/logger')
require('../util/logger').setWithConsole(false)
jest.mock('./get-connect-db')

jest.mock('./config', () => {
  return () => ({
    jobs: {
      schedule: true,
      define: true,
      list: ['HELLO'],
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

describe('Test automate', () => {
  beforeAll(async () => {
    const mongoose = await connect()
    await upsertStatusByType({ type: 'TENANT_NAME', message: 'hostname_test' })
    getConnectDB.mockResolvedValue(mongoose)
  })
  afterAll(async () => {
    await graceful()
  })

  it('Should auto start agenda', (done) => {
    (async () => {
      const agenda = await startScheduler([
        {
          name: HELLO_JOB,
          fn: () => {
            if (!isAgendaStarted()) {
              throw new Error('Agenda is stopped')
            }
          },
          repeatInterval: '*/1 * * * * *',
        }])
      agenda.on('fail', (err, job) => {
        console.log(`Job ${job.name} failed with error: ${err.message}`)
        expect(true).toBe(false)
      })
      expect(isAgendaStarted()).toBe(true)
      await wait1s()
      await stopAgenda()
    })().finally(() => done())
  })

  it('Should auto stop agenda', (done) => {
    (async () => {
      const agenda = await startScheduler([
        {
          name: HELLO_JOB,
          fn: () => {
            if (isAgendaStarted()) {
              throw new Error('Agenda is started')
            }
          },
          repeatInterval: '*/1 * * * * *',
        }])
      agenda.on('fail', (err, job) => {
        console.log(`Job ${job.name} failed with error: ${err.message}`)
        expect(true).toBe(false)
      })
      expect(isAgendaStarted()).toBe(true)
      await upsertStatusByType({ type: 'TENANT_NAME', message: 'hostname_test-1' })
      await wait1s()
      expect(isAgendaStarted()).toBe(false)
      await stopAgenda()
    })().finally(() => done())
  })
})
