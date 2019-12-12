import express from 'express'
import request from 'supertest'
import bodyParser from 'body-parser'
import { verifyAccesPlacesByCandidat } from './verify-candidat'
import { findCandidatById } from '../../../models/candidat'
import { findCentreById } from '../../../models/centre'
import { PARAMETERS_VERSUS_INFOS_CANDIDAT } from '../message.constants'

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
    const { body } = await request(app)
      .get(`${testPrefix}`)
      .set('Accept', 'application/json')
      .expect(401)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', 'Candidat non trouvé')
  })
  it('should 200 when candidat existe and without departement and centre', async () => {
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

  it('should 403 when candidat not same departement for GET', async () => {
    findCandidatById.mockResolvedValue({
      departement: '93',
    })
    const { body } = await request(app)
      .get(`${testPrefix}?departement=94`)
      .set('Accept', 'application/json')
      .expect(403)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', PARAMETERS_VERSUS_INFOS_CANDIDAT)
  })

  it('should 200 when candidat same departement for GET', async () => {
    findCandidatById.mockResolvedValue({
      departement: '94',
    })
    const { body } = await request(app)
      .get(`${testPrefix}?departement=94`)
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('ok', true)
  })

  it('should 403 when candidat not same departement for POST', async () => {
    findCandidatById.mockResolvedValue({
      departement: '93',
    })
    const { body } = await request(app)
      .post(`${testPrefix}`)
      .send({
        departement: '94',
      })
      .set('Accept', 'application/json')
      .expect(403)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', PARAMETERS_VERSUS_INFOS_CANDIDAT)
  })

  it('should 201 when candidat has same departement for POST', async () => {
    findCandidatById.mockResolvedValue({
      departement: '94',
    })
    const { body } = await request(app)
      .post(`${testPrefix}`)
      .send({ departement: '94' })
      .set('Accept', 'application/json')
      .expect(201)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('ok', true)
  })

  it('should 403 when candidat has not same departement with a centre for GET', async () => {
    findCandidatById.mockResolvedValue({
      departement: '93',
    })
    findCentreById.mockResolvedValue({
      departement: '94',
    })
    const { body } = await request(app)
      .get(`${testPrefix}/centreId`)
      .set('Accept', 'application/json')
      .expect(403)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', PARAMETERS_VERSUS_INFOS_CANDIDAT)
  })

  it('should 200 when candidat has same departement with a centre for GET', async () => {
    findCandidatById.mockResolvedValue({
      departement: '94',
    })
    findCentreById.mockResolvedValue({
      departement: '94',
    })
    const { body } = await request(app)
      .get(`${testPrefix}/centreId`)
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('ok', true)
  })

  it('should 403 when candidat has not same departement with a centre for POST', async () => {
    findCandidatById.mockResolvedValue({
      departement: '93',
    })
    findCentreById.mockResolvedValue({
      departement: '94',
    })

    const { body } = await request(app)
      .post(`${testPrefix}`)
      .send({
        id: 'centreId',
      })
      .set('Accept', 'application/json')
      .expect(403)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', PARAMETERS_VERSUS_INFOS_CANDIDAT)
  })

  it('should 201 when candidat has same departement with a centre for POST', async () => {
    findCandidatById.mockResolvedValue({
      departement: '94',
    })
    findCentreById.mockResolvedValue({
      departement: '94',
    })

    const { body } = await request(app)
      .post(`${testPrefix}`)
      .send({
        id: 'centreId',
      })
      .set('Accept', 'application/json')
      .expect(201)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('ok', true)
  })
})
