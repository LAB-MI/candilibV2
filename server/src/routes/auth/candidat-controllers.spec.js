import request from 'supertest'
import express from 'express'

import { connect, disconnect } from '../../mongo-connection'
import { checkCandidat } from './candidat-controllers'
import { verifyToken } from '../middlewares'
import { createCandidat } from '../../models/candidat'

jest.mock('../middlewares/verify-token')
jest.mock('../../util/logger')

const candidat = {
  codeNeph: '123456789000',
  nomNaissance: 'Nom à tester',
  prenom: 'Prénom à tester n°1',
  email: 'test1.test@test.com',
  portable: '0612345678',
  adresse: '10 Rue Oberkampf 75011 Paris',
}
describe('authentification of candidat', () => {
  beforeAll(async () => {
    await connect()
  })
  afterAll(async () => {
    await disconnect()
  })

  const app = express()
  app.use(verifyToken)
  app.get('/', checkCandidat)

  it('should 401 if candidat do not found ', async () => {
    require('../middlewares/verify-token').__setIdCandidat(
      '5d4078f77fb2b90043d96c89'
    )
    require('../../util/logger').setWithConsole(false)

    // When
    const { body, status } = await request(app).get('/')

    // Then
    expect(status).toBe(401)
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', 'Candidat non trouvé')
    expect(body).toHaveProperty('auth', false)
  })

  it('should 200 if candidat found ', async () => {
    const candidatCreated = await createCandidat(candidat)
    require('../middlewares/verify-token').__setIdCandidat(candidatCreated._id)
    require('../../util/logger').setWithConsole(false)

    // When
    const { body, status } = await request(app).get('/')

    // Then
    expect(status).toBe(200)
    expect(body).toHaveProperty('auth', true)
  })
})
