import { appLogger } from '../../util/logger'
import '../../__tests__/jest.utils'

import startScheduler, { graceful, startAgendaAndJobs } from '../automate.js'
import { wait1s } from '../__test__/utils.js'

import { getAutomateJobs } from './scheduler-job-business'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole('error')

const TEST_JOB = 'TEST_JOB'
jest.mock('../config', () => {
  return () => ({
    jobs: {
      schedule: true,
      define: true,
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
const jobsTest = {
  [TEST_JOB]: {
    name: TEST_JOB,
    fn: () => { appLogger.info(`${TEST_JOB} is running`) },
    repeatInterval: '*/1 * * * * *',
  },
}
const jobExpectedFn = (jobTest) => ({
  ...jobTest,
  lastModifiedBy: 'test_schedulename',
  nextRunAt: (job, key) => expect(job).toHavePropertyAtNow(key),
  lockedAt: (job, key) => expect(job).toHavePropertyAtNow(key),
  lastRunAt: undefined,
  lastFinishedAt: undefined,
})

const shouldGetJobFn = async (jobExpectedFn) => {
  const jobs = await getAutomateJobs()
  const expectCalled = expect(jobs)
  expectCalled.toBeDefined()
  expectCalled.toHaveLength(1)
  for (const job of jobs) {
    appLogger.debug({ description: `${TEST_JOB} is ${job}`, job })
    const expectjob = expect(job)
    expectjob.toHaveProperty('name')
    const jobTest = jobsTest[job.name]
    expect(jobTest).toBeDefined()
    const jobExpected = jobExpectedFn(jobTest)
    for (const key in job) {
      if (typeof jobExpected[key] === 'function') {
        jobExpected[key](job, key)
        continue
      }
      expect(job).toHaveProperty(key, jobExpected[key])
    }
  }
}

describe('Manage Job businness', () => {
  beforeAll(async () => {
    const jobs = Object.values(jobsTest)
    await startScheduler(jobs)
    await startAgendaAndJobs(jobs, {})
  })

  afterAll(async () => {
    await graceful()
  })

  it('Should get one job before job ran', async () => {
    await shouldGetJobFn(jobExpectedFn)
  })

  it('Should get one job after job ran', async () => {
    await wait1s()
    const jobExpectedFnAfter1s = (jobTest) => ({
      ...jobExpectedFn(jobTest),
      lockedAt: (job, key) => expect(job).toHavePropertyAtNow(key),
      lastRunAt: (job, key) => expect(job).toHavePropertyAtNow(key),
      lastFinishedAt: (job, key) => expect(job).toHavePropertyAtNow(key),
    })
    await shouldGetJobFn(jobExpectedFnAfter1s)
  })
})
