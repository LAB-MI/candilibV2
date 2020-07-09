import request from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'
import { contactUs } from './contact-us-controller'
import { findDepartementById } from '../../models/departement'
import { findCandidatById } from '../../models/candidat'
import {
  PARAMS_MISSING,
  CONTACT_US_CONFIRM_SEND,
  DEPARTEMENT_EMAIL_MISSING,
} from './message.constants'

jest.mock('../business/send-mail')
jest.mock('../../models/departement')
jest.mock('../../models/candidat')

const contactUsPath = '/contactUs'
const app = express()
app.use(bodyParser.json({ limit: '20mb' }))
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

app.post(
  contactUsPath,
  (req, res, next) => {
    next()
  },
  contactUs,
)
const contactUsConnectedPath = contactUsPath + 'candidatConnected'
app.post(
  contactUsConnectedPath,
  (req, res, next) => {
    req.userId = 'candidatId'
    next()
  },
  contactUs,
)

const candidat = {
  codeNeph: '012345678901',
  nomNaissance: 'TEST NOM',
  prenom: 'Test Prénom',
  portable: '06012345678',
  email: 'test@test.com',
  departement: '93',
}
const subjectTest = 'subject test'
const message = 'test message'
// const candidatId = 'candidatId'

describe('Test controller contact us', () => {
  beforeEach(() => {
    require('../business/send-mail').deleteMails()
  })
  it('Should status 500 when email departement is not found', async () => {
    findDepartementById.mockResolvedValue(null)
    const { body, status } = await request(app)
      .post(contactUsPath)
      .send({ candidat, subject: subjectTest, hasSignUp: false, message })
      .set('Accept', 'application/json')
    expect(status).toBe(500)
    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', DEPARTEMENT_EMAIL_MISSING)
  })

  it('Should status 400 when the params is empty', async () => {
    const { body, status } = await request(app)
      .post(contactUsPath)
      .set('Accept', 'application/json')
    expect(status).toBe(400)
    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', PARAMS_MISSING)
  })

  it('Should status 200 when the unsigned candidat ask a contact', async () => {
    const departementEmail = 'test@departement.com'
    findDepartementById.mockResolvedValue({ email: departementEmail })

    const { body, status } = await request(app)
      .post(contactUsPath)
      .send({ candidat, subject: subjectTest, hasSignUp: false, message })
      .set('Accept', 'application/json')
    expect(status).toBe(200)
    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty(
      'message',
      CONTACT_US_CONFIRM_SEND(candidat.email),
    )
  })

  it('Should status 200 when the signed candidat ask a contact', async () => {
    const departementEmail = 'test@departement.com'
    const departement75Email = 'test.75@departement.com'
    findDepartementById.mockImplementation(dep =>
      dep === '75' ? { email: departement75Email } : { email: departementEmail },
    )
    const candidatInDB = {
      ...candidat,
      homeDepartement: '93',
      departement: '75',
      email: 'test@new.mail.com',
    }
    findCandidatById.mockResolvedValue(candidatInDB)

    const { body, status } = await request(app)
      .post(contactUsConnectedPath)
      .send({ candidat, subject: subjectTest, hasSignUp: false, message })
      .set('Accept', 'application/json')
    expect(status).toBe(200)
    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty(
      'message',
      CONTACT_US_CONFIRM_SEND(candidatInDB.email),
    )
  })
})
