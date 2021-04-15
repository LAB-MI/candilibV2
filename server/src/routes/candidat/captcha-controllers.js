import { getImages, startCaptcha } from './captcha-business'

import { appLogger } from '../../util'

export const initImage = async (req, res) => {
//  await getImage(req, res, appLogger)
  await getImages(req, res, appLogger)
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
