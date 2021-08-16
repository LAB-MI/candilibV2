import SessionCandidatModel from './session-candidat-model'

/**
 * Crée un département
 *
 * @async
 * @function
 *
 * @param {Object} sessionInfo
 * @param {string} userId - Identifiant de l'utilisteur
 * @param {string} content - Contenu de la session (contient le Captcha)
 * @param {number} count - Compte des tentatives Captcha
 * @param {date} expires - Expiration du Captcha
 *
 * @returns {Promise.<SessionCandidatMongooseDocument>} - La session candidat créé
 */

export const createSession = async (sessionInfo) => {
  const result = await SessionCandidatModel.create(sessionInfo)
  return result
}

export const upsertSession = async (sessionInfo) => {
  const neededKey = checkKeyNeedUpdate(sessionInfo)
  const result = await SessionCandidatModel
    .findOneAndUpdate({ userId: sessionInfo.userId }, { $set: neededKey }, { upsert: true, new: true })
  return result
}

const checkKeyNeedUpdate = (sessionInfo) => {
  const {
    session,
    count,
    expires,
    canRetryAt,
    captchaExpireAt,
    forwardedFor,
    clientId,
    hashCaptcha,
  } = sessionInfo

  const neededKey = {}

  if (count !== undefined) {
    neededKey.count = count
  }

  if (canRetryAt !== undefined) {
    neededKey.canRetryAt = canRetryAt
  }

  if (session) {
    neededKey.session = session
  }

  if (expires) {
    neededKey.expires = expires
  }

  if (captchaExpireAt) {
    neededKey.captchaExpireAt = captchaExpireAt
  }

  if (forwardedFor) {
    neededKey.forwardedFor = forwardedFor
  }

  if (clientId) {
    neededKey.clientId = clientId
  }

  if (hashCaptcha) {
    neededKey.hashCaptcha = hashCaptcha
  }

  return neededKey
}

export const updateSession = async (sessionInfo) => {
  const { userId } = sessionInfo
  const neededKey = checkKeyNeedUpdate(sessionInfo)
  const result = await SessionCandidatModel.updateOne({ userId: userId }, { $set: neededKey })

  return result
}

export const updateSessionId = async (sessionInfo) => {
  const { userId, forwardedFor, clientId } = sessionInfo
  const result = await SessionCandidatModel.updateOne({ userId: userId }, { $set: { forwardedFor, clientId } })

  return result
}

export const getSessionByCandidatIdAndInfos = async ({ userId, forwardedFor, clientId, hashCaptcha }) => {
  const filters = hashCaptcha ? { userId, forwardedFor, clientId, hashCaptcha } : { userId, forwardedFor, clientId }
  const result = await SessionCandidatModel.findOne(filters).lean()
  return result
}

export const getSessionByCandidatId = async ({ userId }) => {
  const result = await SessionCandidatModel.findOne({ userId }).lean()
  return result
}

export const deleteSessionByCandidatId = async (userId) => {
  const result = await SessionCandidatModel.deleteOne({ userId })
  return result
}
