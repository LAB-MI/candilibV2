import request from 'supertest'
import { connect, disconnect } from '../../mongo-connection'
import {
  createCentres,
  removeCentres,
  nbCentres,
} from '../../models/__tests__/centres'

const { default: app, apiPrefix } = require('../../app')

jest.mock('../middlewares/verify-token')

describe('Test centre controllers', () => {
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
    await app.close()
  })

  describe('Find centres', () => {
    beforeAll(async () => {
      await createCentres()
    })
    afterAll(async () => {
      await removeCentres()
    })
    it('Should response 200 to find all centres', async () => {
      const { body } = await request(app)
        .get(`${apiPrefix}/candidat/centres`)
        .send()
        .set('Accept', 'application/json')
        .expect(200)

      expect(body).toBeDefined()
      expect(body).toHaveLength(nbCentres())
    })
    it('Should response 200 to find centre from departemnt 93', async () => {
      const departement = '93'
      const { body } = await request(app)
        .get(`${apiPrefix}/candidat/centres?departement=${departement}`)
        .send()
        .set('Accept', 'application/json')
        .expect(200)

      expect(body).toBeDefined()
      expect(body).toHaveLength(nbCentres(departement))
    })
  })
})
