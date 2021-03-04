import {
  getSessionByCandidatId,
  createSession,
  updateSession,
} from '../../models/session-candidat'
import { connect, disconnect } from '../../mongo-connection'
import { createCandidat } from '../../models/candidat'
import { getFrenchLuxon } from '../../util'

const validEmail = 'candidat@example.com'
const portable = '0612345678'
const adresse = '10 Rue Hoche 93420 Villepinte'
const nomNaissance = 'Dupont'
const prenom = 'Jean'
const codeNeph = '123456789012'

describe('Captcha Business', () => {
  let candidat1
  beforeAll(async () => {
    await connect()

    candidat1 = await createCandidat({
      codeNeph,
      nomNaissance,
      prenom,
      email: validEmail,
      portable,
      adresse,
    })
  })

  afterAll(async () => {
    await disconnect()
  })

  it('should save an session candidat', async () => {
    // Given
    // const sessionFake = {
    //   userId: candidat1._id,
    //   session: JSON.stringify({ key: 'value' }),
    //   expires: new Date(),
    // }

    const dateExpires = getFrenchLuxon()
    const dateExpiresPlus2Min = dateExpires.plus({ minutes: 2 })
    const currentSession = {
      userId: candidat1._id,
      session: {},
      expires: dateExpires.toISO(),
      count: 0,
    }
    // const tmpSession = {}
    try {
      // When
      const createdSession = await createSession(currentSession)
      console.log({ createdSession })
      const visualCaptcha = require('visualcaptcha')(createdSession.session, currentSession.userId)
      visualCaptcha.generate(5)

      console.log({ createdSession })
      const sessionInfos = await getSessionByCandidatId(candidat1._id)

      const { userId, session, count, canRetryAt } = createdSession
      const sessionTmp = {
        userId,
        expires: dateExpiresPlus2Min.toISO(),
        session,
        count,
        canRetryAt,
      }
      console.log({ sessionTmp })
      const updatedSession = await updateSession(sessionTmp)
      const sessionInfos2 = await getSessionByCandidatId(candidat1._id)
      console.log({ updatedSession })
      console.log({ sessionInfos })
      console.log({ sessionInfos2 })
      // console.log(`visualcaptcha_${candidat1._id}`, savedSessionCandidat.session[`visualcaptcha_${candidat1._id}`])

      // const savedSessionCandidat2 = await createSession(currentSession)
      // const sessionInfos2 = await getSessionByCandidatId(candidat1._id)
      // console.log({ sessionInfos2 })
      // console.log({ savedSessionCandidat2 })
      // const savedSessionCandidat = await createSession(sessionFake)
      expect({}).toHaveProperty('isNew', false)
    } catch (error) {
      console.log({ error })
    }

    // Then
  })
})
