import { getImages, startCaptcha } from './captcha-business'

import { appLogger } from '../../util'

export const initImage = async (req, res) => {
  const { userId } = req
  const loggerInfo = {
    request_id: req.request_id,
    section: 'get-images-captcha',
    userId,
  }

  try {
    const result = await getImages(userId)

    appLogger.info({ ...loggerInfo, description: 'Image captcha demandé', success: true })

    res.set('content-type', result.mimeType)
    // Make sure this is not cached
    res.set('cache-control', 'no-cache, no-store, must-revalidate')
    res.set('pragma', 'no-cache')
    res.set('expires', 0)

    res.send(result.newImage)
  } catch (error) {
    const { message, statusCode } = error
    const success = false

    appLogger.error({
      ...loggerInfo,
      description: message,
      success,
      statusCode,
      error,
    })

    return res.status(statusCode || 500).json({ success, message })
  }
}

export const initCaptcha = async (req, res) => {
  const { userId } = req

  const loggerInfo = {
    request_id: req.request_id,
    section: 'init-captcha',
    userId,
  }

  try {
    const newCaptchaResult = await startCaptcha(userId)
    const { success, statusCode, count, captcha } = newCaptchaResult

    appLogger.info({ ...loggerInfo, description: 'Captcha crée', success, statusCode, count })
    return res.status(statusCode).send({ success, count, captcha })
  } catch (error) {
    let message = error.message

    if (!error.statusCode) {
      message = 'Error startCaptcha'
    }

    appLogger.error({
      ...loggerInfo,
      description: message,
      error,
    })

    return res.status(error.statusCode || 500).json({ success: false, message })
  }
}
