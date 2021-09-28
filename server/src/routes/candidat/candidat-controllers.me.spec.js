import request from 'supertest'

import app, { apiPrefix } from '../../app'
import { updateCandidatToken, findCandidatById } from '../../models/candidat'
import { createToken, getFrenchLuxon } from '../../util'

jest.mock('../business/send-mail')
jest.mock('../../models/candidat')
jest.mock('../middlewares/verify-user')

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)

describe('Get me from candidat', () => {
  let validToken
  let dateEndETGLuxon
  beforeAll(async () => {
    // await connect()
    const dateETGLuxon = getFrenchLuxon()
    dateEndETGLuxon = dateETGLuxon.plus({ years: 5 })
    updateCandidatToken.mockResolvedValue(true)
    validToken = await createToken('idCandidat', 'candidat', undefined, { status: '0', firstConnection: true, dateReussiteETG: dateETGLuxon.toJSDate() })
  })

  // afterAll(async () => {
  //   // await disconnect()
  // })

  it('should response 200 and contetn the informations from candidat', async () => {
    findCandidatById.mockResolvedValue({ status: '1' })
    const { body } = await request(app)
      .get(`${apiPrefix}/candidat/me`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)

    expect(body.candidat).toBeDefined()
    expect(body.candidat).toHaveProperty('visibilityHour', '12H10')
    expect(body.candidat).toHaveProperty('dateETG', dateEndETGLuxon.toISODate())
  })
})
