const request = require('supertest')

const { connect, disconnect } = require('../../mongo-connection')
const { deleteCandidatByNomNeph } = require('../../models/candidat')
const {
  createWhitelisted,
  deleteWhitelistedByEmail,
} = require('../../models/whitelisted')
const { default: app, apiPrefix } = require('../../app')

const validEmail = 'candidat@example.com'
const invalidEmail = 'candidatexample.com'
const portable = '0612345678'
const adresse = '10 Rue Hoche 93420 Villepinte'
const nomNaissance = 'Dupont'
const codeNeph = '123456789012'

const incompleteCandidat = {
  codeNeph,
}

const candidatWithInvalidEmail = {
  codeNeph,
  nomNaissance,
  portable,
  email: invalidEmail,
  adresse,
}

const validCandidat = {
  codeNeph,
  nomNaissance,
  portable,
  email: validEmail,
  adresse,
}

describe('Test the candidat signup', () => {
  beforeAll(async () => {
    await connect()
  })

  afterEach(async () => {
    try {
      await deleteCandidatByNomNeph(nomNaissance, codeNeph)
    } catch (error) {}
  })

  afterAll(async () => {
    await disconnect()
    await app.close()
  })

  it('Should response 400 and a list of fields for an incomplete form', async () => {
    const { body } = await request(app)
      .post(`${apiPrefix}/candidat/preinscription`)
      .send(incompleteCandidat)
      .set('Accept', 'application/json')
      .expect(400)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('fieldsWithErrors')
    expect(body.fieldsWithErrors).toContain('email')
    expect(body.fieldsWithErrors).toContain('nomNaissance')
    expect(body.fieldsWithErrors).toContain('adresse')
    expect(body.fieldsWithErrors).toContain('portable')
    expect(body.fieldsWithErrors).not.toContain('codeNeph')
  })

  it('Should response 400 and a list of 1 field for complete form with an invalid email', async () => {
    const { body } = await request(app)
      .post(`${apiPrefix}/candidat/preinscription`)
      .send(candidatWithInvalidEmail)
      .set('Accept', 'application/json')
      .expect(400)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('fieldsWithErrors')
    expect(body.fieldsWithErrors).toContain('email')
    expect(body.fieldsWithErrors).not.toContain('nomNaissance')
    expect(body.fieldsWithErrors).not.toContain('adresse')
    expect(body.fieldsWithErrors).not.toContain('portable')
    expect(body.fieldsWithErrors).not.toContain('codeNeph')
  })

  it('Should response 200 for a valid form', async () => {
    const { body } = await request(app)
      .post(`${apiPrefix}/candidat/preinscription`)
      .send(validCandidat)
      .set('Accept', 'application/json')
      .expect(401)

    expect(body).toHaveProperty('success', false)
    expect(body).not.toHaveProperty('candidat')
  })

  it('Should response 200 for a valid form', async () => {
    await createWhitelisted(validEmail)

    const { body } = await request(app)
      .post(`${apiPrefix}/candidat/preinscription`)
      .send(validCandidat)
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).not.toHaveProperty('success', false)
    expect(body).not.toHaveProperty('fieldsWithErrors')
    expect(body).toHaveProperty('candidat')
    await deleteWhitelistedByEmail(validEmail)
  })
})
