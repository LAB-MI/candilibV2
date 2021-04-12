import { getSessionByCandidatId, createSession, updateSession } from '../../models/session-candidat'
import { getFrenchFormattedDateTime, getFrenchLuxon, getFrenchLuxonFromJSDate } from '../../util'
import captchaTools from 'visualcaptcha'
import { imagesSetting } from './util'
import { captchaExpireMintutes, nbMinuteBeforeRetry, numberOfImages, tryLimit } from '../../config'
import { modifyImage } from './util/manage-image-jimp'
import crypto from 'crypto'
export const getImage = async (req, res, appLogger) => {
  const { userId } = req
  const indexImage = req?.params?.index

  const loggerInfo = {
    request_id: req.request_id,
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
  const md5Sum = crypto.createHash('md5')
  const md5Sum1 = crypto.createHash('md5')
  const md5SumJpg = crypto.createHash('md5')
  // const md5SumJpg1 = crypto.createHash('md5')
  let isFirst = false
  const dataFile = []
  const dataFile1 = []
  const response = {
    set: (...args) => {
      res.set(args)
    },
    write: (data) => {
      try {
        md5Sum.update(data)
        if (!isFirst) {
          dataFile1.push(data)
          // md5Sum1.update(data)
          isFirst = true
        }
      } catch (error) {
        console.log({ error })
      }

      dataFile.push(data)
      // res.write(dataTmp)
    },
    end: async () => {
      isFirst = false
      const md5data = md5Sum.digest('hex')
      console.log({ md5data, indexImage })
      md5Sum1.update(dataFile[0].slice(0, 200))
      console.log({ md5data1: md5Sum1.digest('hex'), indexImage })

      const dataTmp = await modifyImage(dataFile[0])
      md5SumJpg.update(dataTmp.slice(0, 200))
      console.log({ md5SumJpg: md5SumJpg.digest('hex'), indexImage })
      res.write(dataTmp)
      res.write(dataFile[1])
      res.end()
    },
    status: (value) => {
      return res.status(value)
    },
  }

  try {
    visualCaptcha.streamImage(req?.params?.index, response, isRetina)
  } catch (error) {
    console.log({ error })
    throw error
  }
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
