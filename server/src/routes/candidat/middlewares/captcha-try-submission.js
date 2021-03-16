import { getSessionByCandidatId, updateSession } from '../../../models/session-candidat'
import { getFrenchLuxon, getFrenchLuxonFromJSDate } from '../../../util'

// TODO: mettre dans config.js
const tryLimit = 3
export const trySubmissionCaptcha = async (req, res, next) => {
  const { userId } = req
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

      return res.status(statusCode).json({
        success: false,
        statusCode,
        message: 'Captcha Expiré',
      })
    }

    const {
      expires,
      captchaExpireAt,
      count,
      canRetryAt,
    } = currentSession

    if (getFrenchLuxonFromJSDate(currentSession.captchaExpireAt) < getFrenchLuxon()) {
      await updateSession({
        userId,
        session: {},
        expires,
        captchaExpireAt,
        count,
      })
      // TODO: ADD APPLOGGER
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
      await updateSession({
        userId,
        session: {},
        expires,
        captchaExpireAt,
        count,
      })
      // TODO: ADD APPLOGGER
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

    // TODO: ADD APPLOGGER

    next()
  } catch (error) {
    // TODO: ADD APPLOGGER
    return res.status(500).json({
      success: false,
      message: '[Captcha] Oups ! Une erreur est survenue.',
    })
  }
}
