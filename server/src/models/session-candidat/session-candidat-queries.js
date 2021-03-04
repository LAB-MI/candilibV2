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
  console.log({ sessionInfo })
  // const result = await SessionCandidatModel.findOneAndUpdate({ userId: sessionInfo.userId }, sessionInfo, { upsert: true, new: true })
  const result = await SessionCandidatModel.create(sessionInfo)

  return result
}

export const upsertSession = async (sessionInfo) => {
  const result = await SessionCandidatModel.findOneAndUpdate({ userId: sessionInfo.userId }, sessionInfo, { upsert: true, new: true })
  // const result = await SessionCandidatModel.create(sessionInfo)

  return result
}

export const updateSession = async (sessionInfo) => {
  console.log('sessionInfo::', { sessionInfo })
  // TODO: Create function for each key
  const { userId, session, count, expires, canRetryAt, captchaExpireAt } = sessionInfo
  const result = await SessionCandidatModel.updateOne({ userId: userId }, { $set: { session, count, expires, canRetryAt, captchaExpireAt } })

  return result
}

export const getSessionByCandidatId = async (userId) => {
  const result = await SessionCandidatModel.findOne({ userId })
  // await departement.save()
  return result
}
