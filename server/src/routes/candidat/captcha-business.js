import { getSessionByCandidatId, createSession, updateSession } from '../../models/session-candidat'
import { getFrenchFormattedDateTime, getFrenchLuxon, getFrenchLuxonFromJSDate } from '../../util'
import captchaTools from 'visualcaptcha'
import { imagesSetting } from './util'
import { tryLimit } from '../../config'

// TODO: mettre dans config.js
// const tryLimit = 3
export const getImage = async (req, res, appLogger) => {
  // TODO: Authorize get Images juste 5 time
  const { userId } = req
  const indexImage = req?.params?.index

  const loggerInfo = {
    section: 'get-image-captcha',
    userId,
    indexImage,
  }

  const currentSession = await getSessionByCandidatId(userId)

  if (
    !currentSession ||
    !Object.keys(currentSession.session).length ||
    (currentSession.count > tryLimit) ||
    (getFrenchLuxonFromJSDate(currentSession.captchaExpireAt) < getFrenchLuxon())
  ) {
    const statusCode = 403
    const message = "vous n'êtes pas autorisé"

    appLogger.error({
      ...loggerInfo,
      description: message,
      success: false,
      statusCode,
    })
    return res.status(statusCode).json({ success: false, message })
  }
  let isRetina = false

  const visualCaptcha = captchaTools(currentSession.session, userId)

  // Default is non-retina
  if (req.query.retina) {
    isRetina = false
  }

  appLogger.info({ ...loggerInfo, description: 'Image captcha demandé', success: true })
  visualCaptcha.streamImage(req?.params?.index, res, isRetina)
}

export const startCaptcha = async (userId) => {
  const currentSession = await getSessionByCandidatId(userId)

  let visualCaptcha
  // TODO: mettre dans config.js
  const nbMinuteBeforeRetry = 2
  const captchaExpireMintutes = 1
  const numberOfImages = 5
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
    return {
      success: true,
      count: 1,
      captcha: {
        ...visualCaptcha.getFrontendData(),
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
      dateNow.plus({ minutes: nbMinuteBeforeRetry }),
    )
    // const message = `Dépassement de là limit, veuillez réssayer dans ${nbMinuteBeforeRetry} minutes`
    const message = `Dépassement de là limit, veuillez réssayer à ${dateTimeWhichCanTryAgain.hour}`
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
  return {
    success: true,
    count: countAndCanRetryAt.count,
    captcha: {
      ...visualCaptcha.getFrontendData(),
      audioFieldName: undefined,
    },
    statusCode,
  }
}
