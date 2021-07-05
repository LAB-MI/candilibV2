import { getSessionByCandidatId, createSession, updateSession } from '../../models/session-candidat'
import { getFrenchFormattedDateTime, getFrenchLuxon, getFrenchLuxonFromJSDate } from '../../util'
import { captchaTools, imagesSetting, getImageNamePic } from './util/captcha-tools'
import { captchaExpireMintutes, nbMinuteBeforeRetry, numberOfImages, tryLimit } from '../../config'

export const verifyAndGetSessionByCandidatId = async (userId, message) => {
  const currentSession = await getSessionByCandidatId(userId)

  if (
    !currentSession ||
    !Object.keys(currentSession.session).length ||
    (currentSession.count > tryLimit) ||
    (getFrenchLuxonFromJSDate(currentSession.captchaExpireAt) < getFrenchLuxon())
  ) {
    const statusCode = 403
    const error = new Error(message)
    error.statusCode = statusCode
    throw error
  }
  return currentSession
}

export const getImages = async (userId) => {
  const message = "vous n'êtes pas autorisé"

  const currentSession = await verifyAndGetSessionByCandidatId(userId, message)

  const visualCaptcha = captchaTools(currentSession.session, userId)
  // visualCaptcha.streamImages = streamImages

  // Default is non-retina
  const isRetina = false
  const result = await visualCaptcha.streamImages(isRetina)
  return result
}

export const startCaptcha = async (userId) => {
  const currentSession = await getSessionByCandidatId(userId)

  let visualCaptcha
  const dateNow = getFrenchLuxon()
  let statusCode

  if (!currentSession) {
    const sessionTmp = {}
    visualCaptcha = captchaTools(sessionTmp, userId, imagesSetting)
    visualCaptcha.generate(numberOfImages)

    const expires = dateNow.endOf('day').toISO()
    const captchaExpireAt = dateNow.plus({ minutes: captchaExpireMintutes }).toISO()
    const count = 1

    await createSession({
      userId,
      session: sessionTmp,
      expires,
      captchaExpireAt,
      count,
    })

    statusCode = 200
    const frontendData = visualCaptcha.getFrontendData()
    return {
      success: true,
      count: 1,
      captcha: {
        ...frontendData,
        imageName: undefined,
        imageNamePic: await getImageNamePic(frontendData),
        audioFieldName: undefined,
      },
      statusCode,
    }
  }

  const { count, canRetryAt } = currentSession
  let tmpCount = count

  if (canRetryAt && dateNow > getFrenchLuxonFromJSDate(canRetryAt)) {
    tmpCount = 0
  }

  if (tmpCount >= tryLimit) {
    if (Object.keys(currentSession.session).length) {
      await updateSession({
        ...currentSession,
        count: tmpCount + 1,
        session: {},
      })
    }

    statusCode = 403
    const dateTimeWhichCanTryAgain = getFrenchFormattedDateTime(
      getFrenchLuxonFromJSDate(canRetryAt),
    )
    const message = `Dépassement de la limite, veuillez réssayer à ${dateTimeWhichCanTryAgain.hour}`
    // TODO: envoyer le nombre de minute restante
    const error = new Error(message)
    error.statusCode = statusCode

    throw error
  }

  const newSessionContent = {}

  visualCaptcha = captchaTools(newSessionContent, userId, imagesSetting)
  visualCaptcha.generate(numberOfImages)

  const captchaExpireAt = dateNow.plus({ minutes: captchaExpireMintutes }).toISO()
  const newCount = tmpCount + 1
  const countAndCanRetryAt =
        !(newCount < tryLimit) ? {
          count: newCount,
          canRetryAt: dateNow.plus({ minutes: nbMinuteBeforeRetry }).toISO(),
        }
          : { count: newCount, canRetryAt: null }

  await updateSession({
    userId,
    session: newSessionContent,
    ...countAndCanRetryAt,
    captchaExpireAt,
  })

  statusCode = 200
  const frontendData = visualCaptcha.getFrontendData()

  return {
    success: true,
    count: countAndCanRetryAt.count,
    captcha: {
      ...frontendData,
      imageName: undefined,
      imageNamePic: await getImageNamePic(frontendData),
      audioFieldName: undefined,
    },
    statusCode,
  }
}
