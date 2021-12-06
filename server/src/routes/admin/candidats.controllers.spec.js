import request from 'supertest'
import { getFrenchLuxon } from '../../util'
import candidatModel from '../../models/candidat/candidat.model'
import { createCandidat } from '../../models/candidat'
import { BAD_PARAMS } from './message.constants'
import { createDepartement } from '../../models/departement'
import { createUser } from '../../models/user'

const { connect, disconnect } = require('../../mongo-connection')
const {
  createCandidats,
  makeResas,
  createPlaces,
  deleteCandidats,
  removePlaces,
  candidats,
  createCentres,
  removeCentres,
} = require('../../models/__tests__')

const { default: app, apiPrefix } = require('../../app')

jest.mock('./middlewares/verify-user-level')
jest.mock('../middlewares/verify-token')
jest.mock('../business/send-mail')
jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)

const bookedAt = getFrenchLuxon().toJSDate()

xdescribe('Test get and export candidats', () => {
  beforeAll(async () => {
    await connect()
    await createCandidats()
    await createCentres()
    await createPlaces()
    await makeResas(bookedAt)
  })

  afterAll(async () => {
    await removePlaces()
    await removeCentres()
    await deleteCandidats()
    await disconnect()
  })

  it('Should response 200 with list candidats', async () => {
    const { body } = await request(app)
      .get(`${apiPrefix}/admin/candidats?departement=93`)
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)

    expect(body.length).toBe(candidats.length)
  })
  it('Should response 200 with list candidats in a file', async () => {
    const { text } = await request(app)
      .get(`${apiPrefix}/admin/candidats?format=csv&departement=93`)
      .expect('Content-Type', 'text/csv; charset=utf-8')
      .expect(
        'Content-Disposition',
        'attachment; filename="candidatsLibresPrintel.csv"',
      )
      .expect(200)

    expect(text).not.toBe(expect.anything())
    expect(text.split('\n').length).toBe(candidats.length + 1)
  })
})

describe('Test update candidat e-mail and homeDepartement by admin and remove penalty', () => {
  const candidatToCreate = {
    codeNeph: '123456789000',
    nomNaissance: 'Nom à tester',
    prenom: 'Prénom à tester n°1',
    email: 'test1.test@test.com',
    portable: '0612345678',
    departement: '93',
    homeDepartement: '75',
  }
  const user = {
    email: 'Admin@example.com',
    password: 'S3cr3757uff!',
    departements: ['75', '93'],
  }

  const user76 = {
    email: 'Admin76@example.com',
    password: 'S3cr3757uff!',
    departements: ['76'],
  }

  let candidatCreated
  let userCreated
  let user76Created
  beforeAll(async () => {
    await connect()
    await createDepartement({ _id: '78', email: '78@dep.com', isAddedRecently: false })
    candidatCreated = await createCandidat(candidatToCreate)
    userCreated = await createUser(user.email, user.password, user.departements)
    user76Created = await createUser(user76.email, user76.password, user76.departements)
    require('../middlewares/verify-token').__setIdAdmin(
      userCreated._id,
      userCreated.departements,
    )
  })
  afterAll(async () => {
    await candidatModel.deleteOne({ _id: candidatCreated._id })
    await userCreated.deleteOne()
    await user76Created.deleteOne()
    await disconnect()
  })

  const itHttpRequest = async (bodyToSend = {}, status) => {
    const { body } = await request(app)
      .patch(`${apiPrefix}/admin/candidats/${candidatCreated._id}`)
      .send(bodyToSend)
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(status)

    return body
  }
  const itWithBadParams = async (bodyToSend, message) => {
    const body = await itHttpRequest(bodyToSend, 400)
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', message || BAD_PARAMS)
  }
  it('should 400 when params is undefined', async () => {
    await itWithBadParams()
  })

  it('should 400 when email do not  have the good format', async () => {
    await itWithBadParams({ email: 'test.com' })
  })

  it('should 400 when it is the same email ', async () => {
    await itWithBadParams({ email: candidatToCreate.email }, "Pas de modification pour le candidat 123456789000/NOM A TESTER. La nouvelle adresse courriel est identique à l'ancienne.")
  })

  it('should 200 when update candidat email', async () => {
    const body = await itHttpRequest({ email: 'test.update@test.com' }, 200)
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message', 'Le courriel du candidat 123456789000/NOM A TESTER a été changé.')
  })

  it('should 400 when homeDepartement does not exist', async () => {
    await itWithBadParams({ homeDepartement: '11' })
  })

  it('should 200 when update candidat homeDepartement', async () => {
    const body = await itHttpRequest({ homeDepartement: '78' }, 200)
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message', 'Le département de résidence du candidat 123456789000/NOM A TESTER a été changé.')
  })

  it('should 400 when update candidat with same portable', async () => {
    await itWithBadParams({ phoneNumber: candidatToCreate.portable }, "Pas de modification pour le candidat 123456789000/NOM A TESTER. Le nouveau numéro de  téléphone est identique à l'ancien.")
  })

  it('should 200 when update candidat portable', async () => {
    const body = await itHttpRequest({ phoneNumber: '0621323445' }, 200)
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message', 'Le numéro de téléphone du candidat 123456789000/NOM A TESTER a été changé.')
  })

  it('should 400 when send a email and removePenalty', async () => {
    await itWithBadParams({ email: 'test@ŧest.com', removePenalty: true })
  })

  it('should 400 when send removPenalty at false', async () => {
    await itWithBadParams({ removePenalty: false })
  })

  it('should 400 when send removPenalty at true without canBookFrom', async () => {
    await itWithBadParams({ removePenalty: true }, "Le candidat n'a pas de date de fin pénalité")
  })

  it('should 200 when send removPenalty at true with canBookFrom', async () => {
    candidatCreated.canBookFrom = getFrenchLuxon().plus({ days: 10 })
    await candidatCreated.save()
    const body = await itHttpRequest({ removePenalty: true }, 200)
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message', `La pénalité du candidat ${candidatCreated.codeNeph}/${candidatCreated.nomNaissance} a été retirée.`)
    candidatCreated.canBookFrom = undefined
    await candidatCreated.save()
  })

  it('should 400 when send removPenalty at true with canBookFrom using by admin 76', async () => {
    require('../middlewares/verify-token').__setIdAdmin(
      user76Created._id,
      user76Created.departements,
    )

    candidatCreated.canBookFrom = getFrenchLuxon().plus({ days: 10 })
    await candidatCreated.save()

    await itWithBadParams({ removePenalty: true }, `Vous n'êtes pas autorisé à retirer la pénalité de ce candidat. Veuillez contacter les répartiteurs du département ${candidatCreated.departement}.`)

    candidatCreated.canBookFrom = undefined
    await candidatCreated.save()
  })
})
