import {
  getSessionByCandidatId,
  createSession,
  deleteSessionByCandidatId,
  updateSession,
} from './session-candidat-queries'
import { connect, disconnect } from '../../mongo-connection'
import { createCandidat } from '../candidat'
import { getFrenchLuxon, getFrenchLuxonFromISO } from '../../util'

const validEmail = 'candidat@example.com'
const portable = '0612345678'
const adresse = '10 Rue Hoche 93420 Villepinte'
const nomNaissance = 'Dupont'
const prenom = 'Jean'
const codeNeph = '123456789012'

// TODO: Find the best solution for export and share with other test
const expectedCommonSession = (expectedSession, sessionToHave) => {
  expect(expectedSession).toHaveProperty('session')
  expect(expectedSession).toHaveProperty('userId', sessionToHave.userId)
}

const expectedExtraSession = (expectedSession, sessionToHave, optionToCheck) => {
  const { isCount, isSessionCaptcha, isCanRetryAt, isCaptchaExpireAt, isExpires } = optionToCheck
  expectedCommonSession(expectedSession, sessionToHave)

  if (isCount) {
    expect(expectedSession).toHaveProperty('count', sessionToHave.count)
  }

  if (isSessionCaptcha) {
    expect(expectedSession).toHaveProperty('session', sessionToHave.session)
    expect(expectedSession.session).toHaveProperty('key', sessionToHave.session.key)
  }

  if (isCanRetryAt) {
    expect(expectedSession).toHaveProperty('canRetryAt', getFrenchLuxonFromISO(sessionToHave.canRetryAt).toJSDate())
  }

  if (isCaptchaExpireAt) {
    expect(expectedSession).toHaveProperty('captchaExpireAt', getFrenchLuxonFromISO(sessionToHave.captchaExpireAt).toJSDate())
  }

  if (isExpires) {
    expect(expectedSession).toHaveProperty('expires', getFrenchLuxonFromISO(sessionToHave.expires).toJSDate())
  }
}

describe('SessionCandidat', () => {
  let candidat1
  let sessionFake
  const dateNow = getFrenchLuxon()

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

    sessionFake = {
      userId: candidat1._id,
      session: JSON.stringify({ key: 'value' }),
      expires: dateNow.toISO(),
      captchaExpireAt: dateNow.toISO(),
      count: 0,
    }
  })

  afterEach(async () => {
    await deleteSessionByCandidatId(candidat1._id)
  })

  afterAll(async () => {
    await disconnect()
  })

  it('should save an session candidat', async () => {
    const savedSessionCandidat = await createSession(sessionFake)
    const optionToCheck = {
      isCount: true,
      isSessionCaptcha: true,
      isCanRetryAt: false,
      isCaptchaExpireAt: true,
      isExpires: true,
    }
    expectedExtraSession(savedSessionCandidat, sessionFake, optionToCheck)
  })

  it('should update an session candidat', async () => {
    const sessionInfo = {
      userId: candidat1._id,
      session: { key: 'value' },
      count: 2,
      expires: dateNow.endOf('day').toISO(),
      canRetryAt: dateNow.plus({ minutes: 2 }).toISO(),
      captchaExpireAt: dateNow.endOf('day').toISO(),
    }

    await createSession(sessionFake)
    const updatedStatus = await updateSession(sessionInfo)

    expect(updatedStatus).toHaveProperty('nModified', 1)
    expect(updatedStatus).toHaveProperty('n', 1)

    const sessionAfterUpdate = await getSessionByCandidatId(candidat1._id)

    const optionToCheck = {
      isCount: true,
      isSessionCaptcha: true,
      isCanRetryAt: true,
      isCaptchaExpireAt: true,
      isExpires: true,
    }
    expectedExtraSession(sessionAfterUpdate, sessionInfo, optionToCheck)
  })
})
