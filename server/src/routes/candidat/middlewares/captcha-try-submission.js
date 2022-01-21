import { updateSession } from '../../../models/session-candidat'
import { getFrenchLuxon, appLogger, getFrenchLuxonFromISO } from '../../../util'
import { verifyAndGetSessionByCandidatId } from '../captcha-business'
import { captchaTools, getHashCaptcha, isValidRef } from '../util/captcha-tools'

export const trySubmissionCaptcha = async (req, res, next) => {
  const { userId } = req
  const clientId = req.headers['x-client-id']
  const forwardedFor = req.headers['x-forwarded-for']

  const {
    nomCentre,
    geoDepartement,
    date,
  } = req.body

  const loggerInfo = {
    request_id: req.request_id,
    section: 'try-submition-captcha',
    userId,
  }

  const queryParams = []

  try {
    const message = 'Captcha Expiré'

    const shapedDate = getFrenchLuxonFromISO(date).toISO()

    const hashCaptcha = getHashCaptcha({
      geoDepartement,
      nomCentre,
      placeDate: shapedDate,
    })

    const currentSession = await verifyAndGetSessionByCandidatId({
      userId,
      forwardedFor,
      clientId,
      hashCaptcha,
    }, message)

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
        // const isValid = (visualCaptcha.validateImage(imageAnswer))
        if (visualCaptcha.validateImage(imageAnswer)) {
          queryParams.push('status=validImage')
          const isRefValid = await isValidRef(req)
          responseStatus = isRefValid ? queryParams.push('status=refValid') && 200 : queryParams.push('status=refInvalid') && 400
          console.log('isRefValid-responseStatus', responseStatus)
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
