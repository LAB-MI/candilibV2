import mongoose from 'mongoose'
import request from 'supertest'
import { createArchivedPlace } from '../../models/archived-place/archived-place-queries'
import { getFrenchLuxon, getFrenchLuxonFromJSDate } from '../../util'
import { REASON_ABSENT_EXAM, REASON_REMOVE_RESA_ADMIN } from '../common/reason.constants'
import { BAD_PARAMS } from './message.constants'
import '../../__tests__/jest.utils'
import { BY_AURIGE } from './business'

const { connect, disconnect } = require('../../mongo-connection')

const { default: app, apiPrefix } = require('../../app')

jest.mock('./middlewares/verify-user-level')
jest.mock('../middlewares/verify-token')
jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)

const createArchivedPlaces = async () => {
  const archivedPlacesToCreate = [{
    date: getFrenchLuxon().minus({ days: 5 }).toISO(),
    centre: new mongoose.Types.ObjectId(),
    inspecteur: new mongoose.Types.ObjectId(),
    placeId: new mongoose.Types.ObjectId(),
    archivedAt: getFrenchLuxon().minus({ days: 1 }).toISO(),
    archiveReasons: [REASON_ABSENT_EXAM],
    isCandilib: true,
    byUser: 'AURIGE',
    candidat: {
      _id: new mongoose.Types.ObjectId(),
      nomNaissance: 'testNom',
      codeNeph: '01234567891',
      email: 'testNom.testprenom@email.com',
      portable: '0612345678',
    },
  }, {
    date: getFrenchLuxon().minus({ days: 5 }).toISO(),
    centre: new mongoose.Types.ObjectId(),
    inspecteur: new mongoose.Types.ObjectId(),
    placeId: new mongoose.Types.ObjectId(),
    archivedAt: getFrenchLuxon().minus({ days: 1 }).toISO(),
    archiveReasons: [REASON_REMOVE_RESA_ADMIN],
    isCandilib: true,
    byUser: 'admin@test.com',
    candidat: {
      _id: new mongoose.Types.ObjectId(),
      nomNaissance: 'testNom',
      codeNeph: '01234567891',
      email: 'testNom.testprenom@email.com',
      portable: '0612345678',
    },
  }]
  return await Promise.all(archivedPlacesToCreate.map(archivedPlace => createArchivedPlace(archivedPlace)))
}

describe('archived-places controllers', () => {
  let archivedPlaces
  beforeAll(async () => {
    await connect()
    archivedPlaces = await createArchivedPlaces()
  })

  afterAll(async () => {
    await disconnect()
  })

  it('should 400 find archive place whitout queries', async () => {
    const { body } = await request(app)
      .get(`${apiPrefix}/admin/archived-places`)
      .expect(400)
    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', BAD_PARAMS)
  })

  it('should find one archive place', async () => {
    const archivedPlace = archivedPlaces[0]
    const date = getFrenchLuxonFromJSDate(archivedPlace.date)
    const url = `${apiPrefix}/admin/archived-places?ipcsr=${archivedPlace.inspecteur.toString()}&date=${date.toISODate()}`
    const { body } = await request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('archivedPlaces')
    expect(body.archivedPlaces).toHaveLength(1)
    // expect(body.archivedPlaces[0]).toMatchObject(archivedPlace)

    expect(body.archivedPlaces[0]).toHaveDateProperty('archivedAt', archivedPlace.archivedAt)
    expect(body.archivedPlaces[0]).toHaveDateProperty('date', archivedPlace.date)
    expect(body.archivedPlaces[0]).toHaveProperty('centre', archivedPlace.centre.toString())
    expect(body.archivedPlaces[0]).toHaveProperty('inspecteur', archivedPlace.inspecteur.toString())
    expect(body.archivedPlaces[0]).toHaveProperty('placeId', archivedPlace.placeId.toString())
    expect(body.archivedPlaces[0]).toHaveProperty('byUser', BY_AURIGE)
    expect(body.archivedPlaces[0]).toHaveProperty('candidat')
    expect(body.archivedPlaces[0].candidat).toHaveProperty('_id', archivedPlace.candidat._id.toString())
    expect(body.archivedPlaces[0].candidat).toHaveProperty('codeNeph', archivedPlace.candidat.codeNeph)
    expect(body.archivedPlaces[0].candidat).toHaveProperty('nomNaissance', archivedPlace.candidat.nomNaissance)
    expect(body.archivedPlaces[0].candidat).toHaveProperty('portable', archivedPlace.candidat.portable)
  })
})
