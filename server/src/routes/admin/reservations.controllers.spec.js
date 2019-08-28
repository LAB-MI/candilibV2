import request from 'supertest'

import { connect, disconnect } from '../../mongo-connection'

import app, { apiPrefix } from '../../app'
import { createPlaces } from '../../models/__tests__/places'
import { PLACE_IS_NOT_BOOKED, CANCEL_BOOKED_PLACE } from './message.constants'
import { createCentres } from '../../models/__tests__/centres'
import { createCandidats } from '../../models/__tests__/candidats'
import { makeResas } from '../../models/__tests__/reservations'
import { createUser } from '../../models/user'
import { getFrenchLuxon } from '../../util'

const deleteData = elt => {
  return elt.remove()
}
const email = 'test@example.com'
const password = 'S3cr3757uff!'
const deps = ['75', '93']

jest.mock('../business/send-mail')
jest.mock('../middlewares/verify-token')
jest.mock('../../util/logger')

const bookedAt = getFrenchLuxon().toJSDate()

xdescribe('reservation by admin', () => {
  describe('delete reservation by admin', () => {
    let placesCreated
    let candidatsCreated
    let centresCreated
    let admin
    beforeAll(async () => {
      await connect()
      admin = await createUser(email, password, deps)
      centresCreated = await createCentres()
      placesCreated = await createPlaces()
      candidatsCreated = await createCandidats()
      await makeResas(bookedAt)
      require('../middlewares/verify-token').__setIdAdmin(admin._id, deps)
    })

    afterAll(async () => {
      await Promise.all(placesCreated.map(deleteData))
      await Promise.all(centresCreated.map(deleteData))
      await Promise.all(candidatsCreated.map(deleteData))
      await disconnect()
    })

    it('should 400 when a place has not booked', async () => {
      const placeSelected = placesCreated[4]
      const { body } = await request(app)
        .delete(`${apiPrefix}/admin/reservations/${placeSelected._id}`)
        .set('Accept', 'application/json')
        .expect(400)
      expect(body).toBeDefined()
      expect(body).toHaveProperty('success', false)
      expect(body).toHaveProperty('message', PLACE_IS_NOT_BOOKED)
    })
    it('should 200 when a place booked', async () => {
      const placeSelected = placesCreated[0]
      const { body } = await request(app)
        .delete(`${apiPrefix}/admin/reservations/${placeSelected._id}`)
        .set('Accept', 'application/json')
        .expect(200)
      expect(body).toBeDefined()
      expect(body).toHaveProperty('success', true)
      expect(body).toHaveProperty('message', CANCEL_BOOKED_PLACE)
    })
  })
})
