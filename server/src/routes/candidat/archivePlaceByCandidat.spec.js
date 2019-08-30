import request from 'supertest'

import { connect, disconnect } from '../../mongo-connection'

import app, { apiPrefix } from '../../app'
import { createPlaces } from '../../models/__tests__/places'
import { createCentres } from '../../models/__tests__/centres'
import { createCandidatsAndUpdate } from '../../models/__tests__/candidats'
import { findPlaceByCandidatId } from '../../models/place'
import { findCandidatById } from '../../models/candidat'

const deleteData = elt => {
  return elt.remove()
}

jest.mock('../business/send-mail')
jest.mock('../middlewares/verify-token')
jest.mock('../../util/logger')

describe('book and delete reservation by candidat', () => {
  let placesCreated
  let candidatsCreated
  let centresCreated
  beforeAll(async () => {
    await connect()
    centresCreated = await createCentres()
    placesCreated = await createPlaces()
    candidatsCreated = await createCandidatsAndUpdate()
    require('../middlewares/verify-token').__setIdCandidat(
      candidatsCreated[0]._id
    )
  })

  afterAll(async () => {
    await Promise.all(placesCreated.map(deleteData))
    await Promise.all(centresCreated.map(deleteData))
    await Promise.all(candidatsCreated.map(deleteData))
    await disconnect()
  })

  it('should booked place by candidat with info bookedAt', async () => {
    const placeSelected = placesCreated[4]
    const messageToReceive =
      "Votre réservation à l'examen a été prise en compte. Veuillez consulter votre boîte mail."

    const { body } = await request(app)
      .post(`${apiPrefix}/candidat/reservations`)
      .set('Accept', 'application/json')
      .send({
        id: placeSelected.centre,
        date: placeSelected.date,
        isAccompanied: true,
        hasDualControlCar: true,
      })
      .expect(201)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('statusmail', true)
    expect(body).toHaveProperty('message', messageToReceive)

    const placefounded = await findPlaceByCandidatId(candidatsCreated[0]._id)

    expect(placefounded).toBeDefined()
    expect(placefounded).toHaveProperty('bookedAt')
    expect(placefounded).toHaveProperty('date', placeSelected.date)
    expect(placefounded).toHaveProperty('centre', placeSelected.centre)

    const result = await request(app)
      .delete(`${apiPrefix}/candidat/reservations`)
      .set('Accept', 'application/json')
      .send({
        id: placeSelected.centre,
        date: placeSelected.date,
        isAccompanied: true,
        hasDualControlCar: true,
      })
      .expect(200)
    const messageToReceive2 = 'Votre annulation a bien été prise en compte.'
    expect(result.body).toBeDefined()
    expect(result.body).toHaveProperty('success', true)
    expect(result.body).toHaveProperty('statusmail', true)
    expect(result.body).toHaveProperty('message', messageToReceive2)

    const candidatFounded = await findCandidatById(candidatsCreated[0]._id)
    const { places } = candidatFounded
    expect(places[0]).toBeDefined()
    expect(places[0]).toHaveProperty('bookedAt')
    expect(places[0]).toHaveProperty('archiveReason', 'CANCEL')
    expect(places[0]).toHaveProperty('date', placeSelected.date)
    expect(places[0]).toHaveProperty('centre', placeSelected.centre)
  })
})
