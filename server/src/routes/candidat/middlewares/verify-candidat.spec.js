import express from 'express'
import request from 'supertest'
import bodyParser from 'body-parser'
import { verifyAccesPlacesByCandidat } from './verify-candidat'
import { findCandidatById } from '../../../models/candidat'
import { getFrenchLuxon } from '../../../util'

const testPrefix = '/test'
const app = express()
app.use(bodyParser.json({ limit: '20mb' }))
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
app.use((req, res, next) => {
  req.userId = '5dd68953ebb5d0003db93925'
  next()
})
app.get(`${testPrefix}/WithIsInRecently`, (req, res, next) => {
  req.isInRecentlyDept = req.query.isInRecentlyDept === 'true'
  next()
}, verifyAccesPlacesByCandidat, (req, res) =>
  res.json({ ok: true, isInRecentlyDept: req.isInRecentlyDept }),
)

app.get(`${testPrefix}/:id?`, verifyAccesPlacesByCandidat, (req, res) =>
  res.json({ ok: true }),
)
app.post(`${testPrefix}/:id?`, verifyAccesPlacesByCandidat, (req, res) =>
  res.status(201).json({ ok: true }),
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

  it('should 200 and true in isInRecenlty when the candidat has not penatly', async () => {
    findCandidatById.mockResolvedValue({
      departement: '00',
      canBookFrom: getFrenchLuxon().minus({ days: 1 }).toJSDate(),
    })

    const { body } = await request(app)
      .get(`${testPrefix}/WithIsInRecently?isInRecentlyDept=true`)
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('ok', true)
    expect(body).toHaveProperty('isInRecentlyDept', true)
  })

  it('should 200 and true in isInRecenlty when the candidat has penatly', async () => {
    findCandidatById.mockResolvedValue({
      departement: '00',
      canBookFrom: getFrenchLuxon().plus({ days: 1 }).toJSDate(),
    })

    const { body } = await request(app)
      .get(`${testPrefix}/WithIsInRecently?isInRecentlyDept=true`)
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('ok', true)
    expect(body).toHaveProperty('isInRecentlyDept', false)
  })

  it('should 200 and false in isInRecenlty when the candidat has not penatly', async () => {
    findCandidatById.mockResolvedValue({
      departement: '00',
      canBookFrom: getFrenchLuxon().minus({ days: 1 }).toJSDate(),
    })

    const { body } = await request(app)
      .get(`${testPrefix}/WithIsInRecently?isInRecentlyDept=false`)
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('ok', true)
    expect(body).toHaveProperty('isInRecentlyDept', false)
  })
})
