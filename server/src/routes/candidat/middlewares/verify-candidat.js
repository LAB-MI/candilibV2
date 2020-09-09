/**
 * Middleware de vérification de l'accès du candidat
 * @module
 */
import { findCandidatById } from '../../../models/candidat'
import { sendErrorResponse } from '../../../util/send-error-response'

/**
 * Vérifier l'accès du candidat pour obtenir les places et pour réserver
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId - Identifiant du candidat
 * @param {Object} req.query
 * @param {string=} req.query.departement - Département demandé
 * @param {Object} req.body
 * @param {string=} req.body.departement - Département demandé
 * @param {string=} req.body.id - Identifiant du centre demandé
 * @param {Object} req.params
 * @param {string=} req.params.id - Identifiant du centre demandé
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function verifyAccesPlacesByCandidat (req, res, next) {
  const { userId, body, query, params } = req
  const departement = (body && body.departement) || (query && query.departement)
  const centreId = (params && params.id) || (body && body.id)

  const loggerInfo = {
    section: 'candidat-verify',
    userId,
    departement,
    centreId,
  }

  try {
    // appLogger.debug(loggerInfo)
    const candidat = await findCandidatById(userId)
    if (!candidat) {
      const error = new Error('Candidat non trouvé')
      error.status = 401
      error.auth = false
      error.isTokenValid = false
      throw error
    }

    next()
    return
  } catch (error) {
    const { status, auth, isTokenValid, message } = error
    let otherData
    if (auth) {
      otherData = { auth, isTokenValid }
    }
    return sendErrorResponse(res, {
      loggerInfo,
      message,
      status,
      otherData,
    })
  }
}
