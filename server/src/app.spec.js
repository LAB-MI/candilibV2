const request = require('supertest')

const { default: app, apiPrefix } = require('./app')

describe('Test the root path', () => {
  it('Should response the GET method', async () => {
    await request(app)
      .get(`${apiPrefix}`)
      .expect(404)
  })
})
