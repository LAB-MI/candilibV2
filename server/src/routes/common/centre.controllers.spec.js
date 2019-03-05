import request from 'supertest'
import { connect, disconnect } from '../../mongo-connection'
import {
  createCentres,
  removeCentres,
  nbCentres,
  createPlaces,
  removePlaces,
} from '../../models/__tests__/'

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
      await createPlaces()
    })
    afterAll(async () => {
      await removeCentres()
      await removePlaces()
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
    it('Should response 200 and a center', async () => {
      const nom = 'Centre 1'
      const departement = '92'
      const { body: centre } = await request(app)
        .get(
          `${apiPrefix}/candidat/centres?nom=${nom}&departement=${departement}`
        )
        .set('Accept', 'application/json')
        .expect(200)

      expect(centre).toBeDefined()
      expect(centre).not.toBeNull()
      expect(centre).toHaveProperty('nom', nom)
      expect(centre).toHaveProperty('departement', departement)
      expect(centre.adresse).toContain(departement)
    })
  })
})
