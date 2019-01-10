const request = require('supertest')

const { connect, disconnect } = require('../../mongo-connection')
const { default: app, apiPrefix } = require('../../app')
const { createUser, deleteUserByEmail } = require('../../models/user')

const email = 'dontusethiseither@example.com'
const password = 'Abcdefgh1*'
const validUser = {
  email,
  password,
}
const invalidUser = {
  email: 'unexisting@example.com',
  password: 'foo',
}

describe('Test the auth admin', () => {
  beforeAll(async () => {
    await connect()
    await createUser(email, password)
  })

  afterAll(async () => {
    await deleteUserByEmail(email)
    await disconnect()
    await app.close()
  })

  it('Should response the POST method with a 401 for an unknown user', async () => {
    const { body } = await request(app)
      .post(`${apiPrefix}/auth/admin/token`)
      .send(invalidUser)
      .set('Accept', 'application/json')
      .expect(401)

    expect(body).toHaveProperty('success', false)
  })

  it('Should response the POST method with a 401 for a known user with wrong password', async () => {
    const { body } = await request(app)
      .post(`${apiPrefix}/auth/admin/token`)
      .send({ email, password: 'foo' })
      .set('Accept', 'application/json')
      .expect(401)

    expect(body).toHaveProperty('success', false)
  })

  it('Should response the POST method with a 201 for a known user', async () => {
    const { body } = await request(app)
      .post(`${apiPrefix}/auth/admin/token`)
      .send(validUser)
      .set('Accept', 'application/json')
      .expect(201)

    expect(body).toHaveProperty('success', true)
  })
})
