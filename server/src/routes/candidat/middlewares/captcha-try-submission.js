import { tryLimit } from '../../../config'
import { getSessionByCandidatId, updateSession } from '../../../models/session-candidat'
import { getFrenchLuxon, getFrenchLuxonFromJSDate, appLogger } from '../../../util'

// TODO: mettre dans config.js
// const tryLimit = 3
export const trySubmissionCaptcha = async (req, res, next) => {
  const { userId } = req

  const loggerInfo = {
    section: 'try-submition-captcha',
    userId,
  }
  try {
    const currentSession = await getSessionByCandidatId(userId)

    // TODO: Create a function for next condition
    if (
      !currentSession ||
      !Object.keys(currentSession.session).length ||
      currentSession.count > tryLimit ||
      (getFrenchLuxonFromJSDate(currentSession.captchaExpireAt) < getFrenchLuxon())
    ) {
      const statusCode = 403
      // TODO: ADD APPLOGGER
      const message = 'Captcha Expiré'
      appLogger.error({
        ...loggerInfo,
        description: message,
        statusCode,
      })
      return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
      })
    }

    const {
      expires,
      captchaExpireAt,
      count,
      canRetryAt,
    } = currentSession

    const namespace = userId

    const queryParams = []
    let responseStatus

    const visualCaptcha = require('visualcaptcha')(currentSession.session, namespace)
    const frontendData = visualCaptcha.getFrontendData()

    if (namespace && namespace.length !== 0) {
      queryParams.push('namespace=' + namespace)
    }

    if (typeof frontendData === 'undefined') {
      queryParams.push('status=noCaptcha')

      responseStatus = 404
    } else {
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
      const message = 'Réponse invalide'
      appLogger.error({
        ...loggerInfo,
        description: message,
        statusCode: responseStatus,
      })

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
        message,
      })
    }

    appLogger.info({ ...loggerInfo, description: 'Captcha validé', count })

    await updateSession({
      userId,
      session: {},
      captchaExpireAt: getFrenchLuxon().toISO(),
      canRetryAt,
      expires,
      count: 0,
    })

    next()
  } catch (error) {
    // TODO: ADD APPLOGGER
    const message = '[Captcha] Oups ! Une erreur est survenue.'
    appLogger.error({
      ...loggerInfo,
      description: message,
      statusCode: 500,
      error,
    })

    return res.status(500).json({
      success: false,
      message,
    })
  }
}
