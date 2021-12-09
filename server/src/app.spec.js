const request = require('supertest')

const { default: app, apiPrefix } = require('./app')
jest.mock('./util/logger')
require('./util/logger').setWithConsole(false)

describe('Test the root path', () => {
  it('Should response the GET method', async () => {
    await request(app)
      .get(`${apiPrefix}`)
      .expect(404)
  })

  it('Should response the GET method', async () => {
    await request(app)
      .get(`${apiPrefix}/version`)
      .expect(200)
  })
})
