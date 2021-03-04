
// Try to validate the captcha

import { getSessionByCandidatId, updateSession } from '../../../models/session-candidat'
import { getFrenchLuxon, getFrenchLuxonFromJSDate } from '../../../util'

// We need to make sure we generate new options after trying to validate, to avoid abuse
export const trySubmissionCaptcha = async (req, res, next) => {
  const { userId } = req

  const currentSession = await getSessionByCandidatId(userId)
  const {
    expires,
    captchaExpireAt,
    count,
    canRetryAt,
  } = currentSession

  if (!currentSession || (getFrenchLuxonFromJSDate(currentSession.captchaExpireAt) < getFrenchLuxon())) {
    await updateSession({
      userId,
      session: {},
      expires,
      captchaExpireAt,
      count,
    })

    const statusCode = 403
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message: 'Captcha Expiré',
    })
  }
  const namespace = userId

  const queryParams = []
  let responseStatus

  // let session = {} // getSessionByUserId()
  // Initialize visualCaptcha
  const visualCaptcha = require('visualcaptcha')(currentSession.session, namespace)
  const frontendData = visualCaptcha.getFrontendData()

  // Add namespace to query params, if present
  if (namespace && namespace.length !== 0) {
    queryParams.push('namespace=' + namespace)
  }

  if (typeof frontendData === 'undefined') {
    queryParams.push('status=noCaptcha')

    responseStatus = 404
    const responseObject = 'Not Found'
    console.log('Log in trySubmission::', { responseObject })
  } else {
    // If an image field name was submitted, try to validate it
    const imageAnswer = req.body[frontendData.imageFieldName]

    if (imageAnswer) {
      if (visualCaptcha.validateImage(imageAnswer)) {
        queryParams.push('status=validImage')

        responseStatus = 200
      } else {
        queryParams.push('status=failedImage')

        responseStatus = 403
      }
    } else {
      queryParams.push('status=failedPost')

      responseStatus = 403
    }
  }

  if (responseStatus !== 200) {
    await updateSession({
      userId,
      session: {},
      expires,
      captchaExpireAt,
      count,
    })
    return res.status(responseStatus).json({
      success: false,
      status: responseStatus,
      message: 'Réponse invalide',
    })
  }

  await updateSession({
    userId,
    session: {},
    captchaExpireAt: getFrenchLuxon().toISO(),
    canRetryAt,
    expires,
    count,
  })
  next()
}
