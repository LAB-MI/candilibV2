import request from 'supertest'

import { connect, disconnect } from '../../mongo-connection'

import app, { apiPrefix } from '../../app'
import { createPlaces } from '../../models/__tests__/places'
import { createCentres } from '../../models/__tests__/centres'
import { createCandidatsAndUpdate } from '../../models/__tests__/candidats'
import { createUser } from '../../models/user'
import { findPlaceById } from '../../models/place'
import { findCandidatById } from '../../models/candidat'
import { getFrenchFormattedDateTime } from '../../util'

const deleteData = elt => {
  return elt.remove()
}
const email = 'test@example.com'
const password = 'S3cr3757uff!'
const deps = ['75', '93']

jest.mock('../business/send-mail')
jest.mock('../middlewares/verify-token')
jest.mock('../../util/logger')

describe('book and delete reservation by admin', () => {
  let placesCreated
  let candidatsCreated
  let centresCreated
  let admin
  beforeAll(async () => {
    await connect()
    admin = await createUser(email, password, deps)
    centresCreated = await createCentres()
    placesCreated = await createPlaces()
    candidatsCreated = await createCandidatsAndUpdate()
    require('../middlewares/verify-token').__setIdAdmin(admin._id, deps)
  })

  afterAll(async () => {
    await Promise.all(placesCreated.map(deleteData))
    await Promise.all(centresCreated.map(deleteData))
    await Promise.all(candidatsCreated.map(deleteData))
    await admin.remove()
    await disconnect()
  })

  it('should booked place for candidat with info bookedByAdmin', async () => {
    const placeSelected = placesCreated[4]
    const { date, hour } = getFrenchFormattedDateTime(placeSelected.date)
    const messageToReceive = `Le candidat Nom: [${candidatsCreated[0].nomNaissance}] Neph: [${candidatsCreated[0].codeNeph}] a bien été affecté à la place du ${date} à ${hour}`

    const { body } = await request(app)
      .patch(`${apiPrefix}/admin/places/${placeSelected._id}`)
      .set('Accept', 'application/json')
      .send({
        candidatId: candidatsCreated[0]._id,
      })
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message', messageToReceive)
    expect(body).toHaveProperty('place')

    const { place } = body
    expect(place).toBeDefined()
    const result = await findPlaceById(place._id)
    expect(result).toHaveProperty('bookedAt')
    expect(result).toHaveProperty('bookedByAdmin')
    const { _id, email, signUpDate, status } = admin
    const { bookedByAdmin } = result
    expect(bookedByAdmin).toHaveProperty('_id', _id)
    expect(bookedByAdmin).toHaveProperty('departements')
    expect(bookedByAdmin).toHaveProperty('email', email)
    expect(bookedByAdmin).toHaveProperty('signUpDate', signUpDate)
    expect(bookedByAdmin).toHaveProperty('status', status)
    const result2 = await request(app)
      .delete(`${apiPrefix}/admin/places`)
      .set('Accept', 'application/json')
      .send({
        placesToDelete: [place._id],
      })
      .expect(200)
    const messageToReceiveAfterDelete =
      'La suppression des places sélectionnées a bien été effectuée'
    expect(result2.body).toHaveProperty('success', true)
    expect(result2.body).toHaveProperty('message', messageToReceiveAfterDelete)

    const candidatFound = await findCandidatById(candidatsCreated[0]._id)
    expect(candidatFound).toHaveProperty('resaCanceledByAdmin')
    expect(candidatFound).toHaveProperty('places')
    expect(candidatFound.places[0]).toHaveProperty('bookedAt')
    expect(candidatFound.places[0]).toHaveProperty(
      'archiveReason',
      'REMOVE_RESA_ADMIN'
    )

    const { bookedByAdmin: bkdByAdmin } = candidatFound.places[0]

    expect(bkdByAdmin).toHaveProperty('_id', _id)
    expect(bkdByAdmin).toHaveProperty('departements')
    expect(bkdByAdmin).toHaveProperty('email', email)
    expect(bkdByAdmin).toHaveProperty('signUpDate', signUpDate)
    expect(bkdByAdmin).toHaveProperty('status', status)
  })
})
