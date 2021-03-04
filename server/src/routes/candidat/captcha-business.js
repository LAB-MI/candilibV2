import { getSessionByCandidatId, createSession, updateSession } from '../../models/session-candidat'
import { getFrenchLuxon, getFrenchLuxonFromJSDate } from '../../util'
import captchaTools from 'visualcaptcha'

// TODO: mettre dans config.js
const tryLimit = 3
export const getImage = async (req, res, next) => {
  const { userId } = req

  const currentSession = await getSessionByCandidatId(userId)

  if (
    !currentSession ||
    (currentSession.count > tryLimit) ||
    (getFrenchLuxonFromJSDate(currentSession.captchaExpireAt) < getFrenchLuxon())
  ) {
    const statusCode = 403
    const message = 'Unauthorize'
    // TODO: envoyer le nombre de minute restante
    return res.status(statusCode).json({ success: false, message })
  }
  let isRetina = false

  const visualCaptcha = captchaTools(currentSession.session, userId)

  // Default is non-retina
  if (req.query.retina) {
    isRetina = false
  }

  visualCaptcha.streamImage(req.params.index, res, isRetina)
}

export const startRoute = async (req, res, next) => {
  const { userId } = req

  const currentSession = await getSessionByCandidatId(userId)

  let visualCaptcha
  const captchaExpireMintutes = 1
  const numberOfImages = 5

  if (!currentSession) {
    const sessionTmp = {}
    visualCaptcha = captchaTools(sessionTmp, userId)
    visualCaptcha.generate(numberOfImages)

    const expires = getFrenchLuxon().endOf('day').toISO()
    const captchaExpireAt = getFrenchLuxon().plus({ minutes: captchaExpireMintutes }).toISO()
    const count = 1

    const createdSession = await createSession({
      userId,
      session: sessionTmp,
      expires,
      captchaExpireAt,
      count,
    })

    console.log('if (!currentSession) condition::', { createdSession })
    // TODO: envoyer le count d'essais
    return res.status(200).send(visualCaptcha.getFrontendData())
  }
  // TODO: mettre dans config.js
  const nbMinuteBeforeRetry = 2
  const { count, canRetryAt } = currentSession
  let tmpCount = count

  if (canRetryAt && (getFrenchLuxon() > getFrenchLuxonFromJSDate(canRetryAt))) {
    tmpCount = 0
  }

  if (tmpCount < tryLimit) {
    const newSessionContent = {}

    visualCaptcha = captchaTools(newSessionContent, userId)
    visualCaptcha.generate(numberOfImages)

    const captchaExpireAt = getFrenchLuxon().plus({ minutes: captchaExpireMintutes }).toISO()
    const newCount = tmpCount + 1
    const countAndCanRetryAt =
        !(newCount < tryLimit) ? {
          count: newCount,
          canRetryAt: getFrenchLuxon().plus({ minutes: nbMinuteBeforeRetry }),
        }
          : { count: newCount, canRetryAt: null }

    const updatedSession = await updateSession({
      userId,
      session: newSessionContent,
      ...countAndCanRetryAt,
      captchaExpireAt,
    })

    console.log('else (!currentSession) condition::', { updatedSession })
    // TODO: envoyer le count d'essais
    return res.status(200).send(visualCaptcha.getFrontendData())
  }

  const statusCode = 403
  const message = `Dépassement de là limit, veuillez réssayer dans ${nbMinuteBeforeRetry} minutes`
  // TODO: envoyer le nombre de minute restante
  return res.status(statusCode).json({ success: false, message })
}
