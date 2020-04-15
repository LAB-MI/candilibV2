import express from 'express'
import request from 'supertest'
import bodyParser from 'body-parser'
import { verifyAccesPlacesByCandidat } from './verify-candidat'
import { findCandidatById } from '../../../models/candidat'

const testPrefix = '/test'
const app = express()
app.use(bodyParser.json({ limit: '20mb' }))
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
app.use((req, res, next) => {
  req.userId = '5dd68953ebb5d0003db93925'
  next()
})
app.get(`${testPrefix}/:id?`, verifyAccesPlacesByCandidat, (req, res) =>
  res.json({ ok: true })
)
app.post(`${testPrefix}/:id?`, verifyAccesPlacesByCandidat, (req, res) =>
  res.status(201).json({ ok: true })
)

jest.mock('../../../models/candidat')
jest.mock('../../../models/centre')
jest.mock('../../../util/logger')
require('../../../util/logger').setWithConsole(false)

describe('verify acces candidat', () => {
  it('should 401 when candidat not existe', async () => {
    findCandidatById.mockResolvedValue(null)

    const { body } = await request(app)
      .get(`${testPrefix}`)
      .set('Accept', 'application/json')
      .expect(401)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', 'Candidat non trouvé')
  })
  it('should 200 when candidat existe', async () => {
    findCandidatById.mockResolvedValue({
      departement: '93',
    })
    const { body } = await request(app)
      .get(`${testPrefix}`)
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('ok', true)
  })
})
