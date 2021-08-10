import { connect, disconnect } from '../../mongo-connection'
import { createCandidat } from '../../models/candidat'
import { getFrenchFormattedDateTime, getFrenchLuxon, getFrenchLuxonFromJSDate, getFrenchLuxonFromObject } from '../../util'
import app, { apiPrefix } from '../../app'
import request from 'supertest'
import { setNowAfterSelectedHour, setNowAtNow } from './__tests__/luxon-time-setting'
import { deleteSessionByCandidatId, getSessionByCandidatId } from '../../models/session-candidat'
import config, { numberOfImages } from '../../config'

import {
  createCentres,
  centres as centresTests,
  createTestPlace,
  deleteCandidats,
  removeCentres,
  removePlaces,
  inspecteursTests,
  createInspecteurs,
  setInitCreatedCentre,
  resetCreatedInspecteurs,
  setInitCreatedPlaces,
  dateYesterday,
} from '../../models/__tests__'

jest.mock('../middlewares/verify-token')
jest.mock('../middlewares/verify-user')
jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)

const validEmail = 'candidat007@example.com'
const portable = '0612345678'
const adresse = '10 Rue Hoche 93420 Villepinte'
const nomNaissance = 'Dupont'
const prenom = 'Jean'
const codeNeph = '123456789007'
const statusCandidat = '0'

const expectedBodyForCaptcha = (body, expectedValue, isCaptcha) => {
  expect(body).toBeDefined()
  expect(body).toHaveProperty('success')
  expect(body).toHaveProperty('success', expectedValue.success)
  if (!expectedValue.message) {
    expect(body).toHaveProperty('count')
    expect(body).toHaveProperty('count', expectedValue.count)
  } else {
    expect(body).toHaveProperty('message')
    expect(body).toHaveProperty('message', expectedValue.message)
  }

  if (isCaptcha) {
    expect(body).toHaveProperty('captcha')

    const { captcha } = body

    expect(captcha).toHaveProperty('values')
    expect(typeof captcha.values).toBe('object')
    expect(captcha.values.length).toBe(expectedValue.imageCount)
    // expect(captcha).toHaveProperty('imageName')
    // expect(typeof captcha.imageName).toBe('string')
    expect(captcha).toHaveProperty('imageFieldName')
    expect(typeof captcha.imageFieldName).toBe('string')
  }
}

const requestCaptcha = async (captchaPath, expectedValue, { date, geoDepartement, nomCentre }) => {
  const queryDate = `dateTime=${encodeURIComponent(date)}`
  const queryGeoDepartement = `geoDepartement=${geoDepartement}`
  const queryNomCentre = `nomCentre=${nomCentre}`
  const fullquery = `?${queryDate}&${queryNomCentre}&${queryGeoDepartement}`

  await request(app)
    .get(`${apiPrefix}/candidat/places${fullquery}`)
    .set('Accept', 'application/json')
    .set('x-forwarded-for', '127.0.0.1')
    .set('x-client-id', 'FAKE_CLIENT_ID')
    .expect(200)

  const { body } = await request(app)
    .get(`${apiPrefix}/candidat/verifyzone/${captchaPath}`)
    .set('Accept', 'application/json')
    .set('x-forwarded-for', '127.0.0.1')
    .set('x-client-id', 'FAKE_CLIENT_ID')
    .expect(expectedValue.statusCode)
  expectedBodyForCaptcha(body, expectedValue, expectedValue.isCaptcha)
}

const requestTrySubmitionByPlaceRoute = async (expectedValueCaptcha, { nomCentre, geoDepartement, date }) => {
  const { success, message, statusCode } = expectedValueCaptcha

  const { body: bodyPlace } = await request(app)
    .patch(`${apiPrefix}/candidat/places`)
    .set('Accept', 'application/json')
    .set('x-forwarded-for', '127.0.0.1')
    .set('x-client-id', 'FAKE_CLIENT_ID')
    .send({
      nomCentre,
      geoDepartement,
      date,
    })
    .expect(statusCode)

  expect(bodyPlace).toBeDefined()
  expect(bodyPlace).toHaveProperty('success')
  expect(bodyPlace).toHaveProperty('success', success)
  expect(bodyPlace).toHaveProperty('message')
  expect(bodyPlace).toHaveProperty('message', message)
}

const requestImageCaptchaByIndex = async (expectedValueImage, { nomCentre, geoDepartement, date }) => {
  const { indexImage, success, message, statusCode, isMustBeBuffer } = expectedValueImage
  const queryDate = `dateTime=${encodeURIComponent(date)}`
  const queryGeoDepartement = `geoDepartement=${geoDepartement}`
  const queryNomCentre = `nomCentre=${nomCentre}`
  const fullquery = `?${queryDate}&${queryNomCentre}&${queryGeoDepartement}`

  const { body: bodyImage } = await request(app)
    .get(`${apiPrefix}/candidat/verifyzone/image/${indexImage}${fullquery}`)
    .set('Accept', 'application/json')
    .set('x-forwarded-for', '127.0.0.1')
    .set('x-client-id', 'FAKE_CLIENT_ID')
    .expect(statusCode)

  if (isMustBeBuffer) {
    expect(bodyImage instanceof Buffer).toBe(isMustBeBuffer)
  } else {
    expect(bodyImage).toBeDefined()
    expect(bodyImage).toHaveProperty('success')
    expect(bodyImage).toHaveProperty('success', success)
    expect(bodyImage).toHaveProperty('message')
    expect(bodyImage).toHaveProperty('message', message)
  }
}

const basePlaceDateTime = getFrenchLuxonFromObject({ hour: 9 })
const placeCanBook = {
  date: (() =>
    basePlaceDateTime
      .plus({ days: config.delayToBook + 1, hour: 1 })
      .toISO())(),
  centre: centresTests[1],
  inspecteur: inspecteursTests[1],
  createdAt: dateYesterday,
  visibleAt: dateYesterday,
}
describe('Captcha test', () => {
  let candidat1
  let createdCentres
  let createdPlaceCanBook
  let infosPlace

  beforeAll(async () => {
    setInitCreatedCentre()
    resetCreatedInspecteurs()
    setInitCreatedPlaces()
    await connect()

    createdCentres = await createCentres()
    await createInspecteurs()
    createdPlaceCanBook = await createTestPlace(placeCanBook)

    const dateTimeResa = getFrenchLuxonFromJSDate(createdPlaceCanBook.date).toISO()
    infosPlace = { date: dateTimeResa, geoDepartement: createdCentres[1].geoDepartement, nomCentre: createdCentres[1].nom }

    candidat1 = await createCandidat({
      codeNeph,
      nomNaissance,
      prenom,
      email: validEmail,
      portable,
      adresse,
      status: statusCandidat,
    })
  })

  beforeEach(async () => {
    require('../middlewares/verify-token').__setIdCandidat(
      candidat1._id,
      candidat1.status,
    )
  })

  afterEach(async () => {
    setNowAtNow()
    await deleteSessionByCandidatId(candidat1._id)
  })

  afterAll(async () => {
    await removePlaces()
    await removeCentres()
    await deleteCandidats()

    await disconnect()
  })

  it('should generate a captcha util the limit and verify unauthorize for place and get image', async () => {
    const captchaPath = 'start'

    const expectedValue01 = { count: 1, success: true, imageCount: numberOfImages, statusCode: 200, isCaptcha: true }
    await requestCaptcha(captchaPath, expectedValue01, infosPlace)

    const expectedValueImage = { statusCode: 200, indexImage: 0, isMustBeBuffer: true }
    await requestImageCaptchaByIndex(expectedValueImage, infosPlace)

    const expectedValue02 = { count: 2, success: true, imageCount: numberOfImages, statusCode: 200, isCaptcha: true }
    await requestCaptcha(captchaPath, expectedValue02, infosPlace)

    const expectedValue03 = { count: 3, success: true, imageCount: numberOfImages, statusCode: 200, isCaptcha: true }
    await requestCaptcha(captchaPath, expectedValue03, infosPlace)

    const tmpSessionCandiat = await getSessionByCandidatId({ userId: candidat1._id })
    const dateCanTryAt = getFrenchLuxonFromJSDate(tmpSessionCandiat.canRetryAt)

    const expectedValue04 = {
      success: false,
      message: `Dépassement de la limite, veuillez réssayer à ${getFrenchFormattedDateTime(dateCanTryAt).hour}`,
      statusCode: 403,
      isCaptcha: false,
    }
    await requestCaptcha(captchaPath, expectedValue04, infosPlace)

    const expectedValueCaptcha = {
      success: false,
      message: 'Captcha Expiré',
      emptySession: 0,
      statusCode: 403,
    }
    await requestTrySubmitionByPlaceRoute(expectedValueCaptcha, infosPlace)

    const expectedValueImageValid = {
      success: false,
      message: "vous n'êtes pas autorisé",
      emptySession: 0,
      indexImage: 0,
      statusCode: 403,
    }

    await requestImageCaptchaByIndex(expectedValueImageValid, infosPlace)
  })

  it('should not validate captcha after expiration', async () => {
    const captchaPath = 'start'
    // console.log('1er captha')
    const expectedValue01 = { count: 1, success: true, imageCount: numberOfImages, statusCode: 200, isCaptcha: true }
    await requestCaptcha(captchaPath, expectedValue01, infosPlace)

    const dateNow = getFrenchLuxon()
    const minutes = 2
    const nowPlus2Minutes = dateNow.plus({ minutes })
    setNowAfterSelectedHour(nowPlus2Minutes.toJSDate().getHours(), nowPlus2Minutes.minute)

    const expectedValueCaptcha = {
      success: false,
      message: 'Captcha Expiré',
      emptySession: 0,
      statusCode: 403,
    }

    await requestTrySubmitionByPlaceRoute(expectedValueCaptcha, infosPlace)

    const expectedValueImage = {
      success: false,
      message: "vous n'êtes pas autorisé",
      emptySession: 0,
      indexImage: 0,
      statusCode: 403,
    }

    await requestImageCaptchaByIndex(expectedValueImage, infosPlace)

    // console.log('2er captha')
    const expectedValueNewCaptcha = { count: 2, success: true, imageCount: numberOfImages, statusCode: 200, isCaptcha: true }
    await requestCaptcha(captchaPath, expectedValueNewCaptcha, infosPlace)

    // console.log('3er captha')
    const expectedValueNewCaptcha01 = { count: 3, success: true, imageCount: numberOfImages, statusCode: 200, isCaptcha: true }
    await requestCaptcha(captchaPath, expectedValueNewCaptcha01, infosPlace)

    const tmpSessionCandiat = await getSessionByCandidatId({ userId: candidat1._id })
    const dateCanTryAt = getFrenchLuxonFromJSDate(tmpSessionCandiat.canRetryAt)

    // console.log('4er captha')
    const expectedValueNewCaptcha02 = {
      success: false,
      message: `Dépassement de la limite, veuillez réssayer à ${getFrenchFormattedDateTime(dateCanTryAt).hour}`,
      statusCode: 403,
      isCaptcha: false,

    }
    await requestCaptcha(captchaPath, expectedValueNewCaptcha02, infosPlace)

    // Test should not have captcha before canRetryAt
    const minutesDurringCanRetryAt = 1
    const nowPlus2MinutesDurringCanRetryAt = dateCanTryAt.minus({ minutes: minutesDurringCanRetryAt })
    setNowAfterSelectedHour(nowPlus2MinutesDurringCanRetryAt.toJSDate().getHours(), nowPlus2MinutesDurringCanRetryAt.minute)

    // console.log('5er captha')
    const expectedValueDurringCanRetryAt = {
      success: false,
      message: `Dépassement de la limite, veuillez réssayer à ${getFrenchFormattedDateTime(dateCanTryAt).hour}`,
      statusCode: 403,
      isCaptcha: false,

    }
    await requestCaptcha(captchaPath, expectedValueDurringCanRetryAt, infosPlace)

    const minutesAfterCanRetryAt = 3
    const nowPlus2MinutesAfterCanRetryAt = getFrenchLuxon().plus({ minutes: minutesAfterCanRetryAt })
    setNowAfterSelectedHour(nowPlus2MinutesAfterCanRetryAt.toJSDate().getHours(), nowPlus2MinutesAfterCanRetryAt.minute)

    // console.log('6er captha')
    const expectedValueAfterCanRetryAt = { count: 1, success: true, imageCount: numberOfImages, statusCode: 200, isCaptcha: true }
    await requestCaptcha(captchaPath, expectedValueAfterCanRetryAt, infosPlace)
  })

  it('should get image by index', async () => {
    const captchaPath = 'start'

    const expectedValue = { count: 1, success: true, imageCount: numberOfImages, statusCode: 200, isCaptcha: true }
    await requestCaptcha(captchaPath, expectedValue, infosPlace)

    const expectedValueImageValidForIndex0 = { statusCode: 200, indexImage: 0, isMustBeBuffer: true }
    await requestImageCaptchaByIndex(expectedValueImageValidForIndex0, infosPlace)
  })

  it('should not get image', async () => {
    const expectedValueImage = {
      success: false,
      message: "vous n'êtes pas autorisé",
      emptySession: 0,
      indexImage: 0,
      statusCode: 403,
    }

    await requestImageCaptchaByIndex(expectedValueImage, infosPlace)
  })

  it('should not book place with captcha expired', async () => {
    const expectedValueCaptcha = {
      success: false,
      message: 'Captcha Expiré',
      emptySession: 0,
      statusCode: 403,
    }
    await requestTrySubmitionByPlaceRoute(expectedValueCaptcha, infosPlace)
  })

  it('should can add a new captcha after last fail', async () => {
    const captchaPath = 'start'

    const expectedValue01 = { count: 1, success: true, imageCount: numberOfImages, statusCode: 200, isCaptcha: true }
    await requestCaptcha(captchaPath, expectedValue01, infosPlace)

    const expectedValue02 = { count: 2, success: true, imageCount: numberOfImages, statusCode: 200, isCaptcha: true }
    await requestCaptcha(captchaPath, expectedValue02, infosPlace)

    const expectedValue03 = { count: 3, success: true, imageCount: numberOfImages, statusCode: 200, isCaptcha: true }
    await requestCaptcha(captchaPath, expectedValue03, infosPlace)

    const currentSessionCandidat = await getSessionByCandidatId({ userId: candidat1._id })
    const currentSession = currentSessionCandidat.session[`visualcaptcha_${candidat1._id}`]

    const { body: bodyPlace } = await request(app)
      .patch(`${apiPrefix}/candidat/places`)
      .set('Accept', 'application/json')
      .set('x-forwarded-for', '127.0.0.1')
      .set('x-client-id', 'FAKE_CLIENT_ID')
      .send({
        ...infosPlace,
        isAccompanied: true,
        hasDualControlCar: true,
        isModification: false,
      })
      .send({
        [currentSession.frontendData.imageFieldName]: currentSession.validImageOption.value + 'badReponse',
      })
      .expect(403)

    expect(bodyPlace).toBeDefined()
    expect(bodyPlace).toHaveProperty('success')
    expect(bodyPlace).toHaveProperty('success', false)
    expect(bodyPlace).toHaveProperty('message')
    expect(bodyPlace).toHaveProperty('message', 'Réponse invalide')

    const dateCanTryAt = getFrenchLuxonFromJSDate(currentSessionCandidat.canRetryAt)

    const expectedValue04 = {
      success: false,
      message: `Dépassement de la limite, veuillez réssayer à ${getFrenchFormattedDateTime(dateCanTryAt).hour}`,
      statusCode: 403,
      isCaptcha: false,
    }

    await requestCaptcha(captchaPath, expectedValue04, infosPlace)

    const currentSessionCandidatAfterLastTry = await getSessionByCandidatId({ userId: candidat1._id })
    const dateCanTryAtAfterLastTry = getFrenchLuxonFromJSDate(currentSessionCandidatAfterLastTry.canRetryAt)
    const minutes = 1
    const nowPlus2Minutes = dateCanTryAtAfterLastTry.plus({ minutes })
    setNowAfterSelectedHour(nowPlus2Minutes.toJSDate().getHours(), nowPlus2Minutes.minute)

    const expectedValue05 = { count: 1, success: true, imageCount: numberOfImages, statusCode: 200, isCaptcha: true }

    await requestCaptcha(captchaPath, expectedValue05, infosPlace)
  })
})
