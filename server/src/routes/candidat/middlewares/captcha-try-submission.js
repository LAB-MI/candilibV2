import { updateSession } from '../../../models/session-candidat'
import { getFrenchLuxon, appLogger } from '../../../util'
import { verifyAndGetSessionByCandidatId } from '../captcha-business'
import { captchaTools } from '../util/captcha-tools'

export const trySubmissionCaptcha = async (req, res, next) => {
  const { userId } = req

  const loggerInfo = {
    request_id: req.request_id,
    section: 'try-submition-captcha',
    userId,
  }

  const queryParams = []

  try {
    const message = 'Captcha Expiré'

    const currentSession = await verifyAndGetSessionByCandidatId(userId, message)

    const {
      expires,
      captchaExpireAt,
      count,
      canRetryAt,
    } = currentSession

    const namespace = userId

    let responseStatus

    const visualCaptcha = captchaTools(currentSession.session, namespace)
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
        infoStatus: queryParams.join(),
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

    appLogger.info({ ...loggerInfo, description: 'Captcha validé', count, infoStatus: queryParams.join() })

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
    const { statusCode: status } = error
    const message = status ? error.message : '[Captcha] Oups ! Une erreur est survenue.'
    const statusCode = status || 500

    appLogger.error({
      ...loggerInfo,
      description: message,
      statusCode,
      infoStatus: queryParams.join(),
      error,
    })

    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
    })
  }
}
