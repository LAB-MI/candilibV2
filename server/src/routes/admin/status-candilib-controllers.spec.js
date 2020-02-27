import request from 'supertest'
import express from 'express'
import path from 'path'
import fs from 'fs'
import util from 'util'

import { connect, disconnect } from '../../mongo-connection'
import { getFrenchLuxon, getFrenchLuxonFromISO } from '../../util'
import { synchroAurige } from './business/synchro-aurige'

import { getInfoLastSyncAurige } from './status-candilib-controllers'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)

const readFileAsPromise = util.promisify(fs.readFile)

describe('Check canAccess property of aurige', () => {
  let aurigeFile
  const app = express()

  beforeAll(async () => {
    await connect()

    aurigeFile = await readFileAsPromise(
      path.resolve(
        __dirname,
        './business/',
        '__tests__',
        'aurigeWithAccessAt.json'
      )
    )

    app.use((req, res, next) => {
      req.userId = 'ID_DAMIN'
      next()
    })
  })

  it('Should have the date of last sync Aurige', async () => {
    const dateNow = getFrenchLuxon().toLocaleString()

    await synchroAurige(aurigeFile)
    app.get('/last-sync-aurige-info', getInfoLastSyncAurige)
    const { body } = await request(app)
      .get('/last-sync-aurige-info')
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('aurigeInfo')
    expect(body.aurigeInfo).toHaveProperty('date')
    expect(getFrenchLuxonFromISO(body.aurigeInfo.date).toLocaleString()).toBe(
      dateNow
    )
    expect(body.aurigeInfo).toHaveProperty('message')
  })

  afterAll(async () => {
    await disconnect()
    await app.close()
  })
})
