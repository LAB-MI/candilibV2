import jwt from 'jsonwebtoken'

import config from '../config'
import { updateCandidatToken } from '../models/candidat'
import { NB_YEARS_ETG_EXPIRED } from './constants'
import { getFrenchLuxonFromJSDate } from './date-util'

export const createToken = async (id, userStatus, departements, detailContentCandidat = {}) => {
  const {
    nomNaissance,
    codeNeph,
    status,
    adresse,
    homeDepartement,
    departement,
    email,
    isEvaluationDone,
    portable,
    prenom,
    token,
    firstConnection,
    dateReussiteETG,
  } = detailContentCandidat

  const isInRecentlyDept = await detailContentCandidat.isInRecentlyDept

  const level = config.userStatusLevels[userStatus] || 0
  const tokenExpiration = config[`${userStatus}TokenExpiration`]
  const dateETG = dateReussiteETG && getFrenchLuxonFromJSDate(dateReussiteETG).plus({ years: NB_YEARS_ETG_EXPIRED }).toISODate()
  const payload = {
    id,
    level,
    departements,
    candidatStatus: status,
    nomNaissance,
    codeNeph,
    adresse,
    homeDepartement,
    departement,
    email,
    isEvaluationDone,
    portable,
    prenom,
    firstConnection: !!firstConnection,
    dateETG,
    isInRecentlyDept,
  }

  const secret = config.secret

  const options = {
    expiresIn: tokenExpiration || 0,
  }

  if (level === 0 && isTokenAlreadyValid(token)) {
    const oldToken = token
    return oldToken
  }
  // appLogger.debug({ action: 'create-token', payload, options })

  const newToken = jwt.sign(payload, secret, options)

  if (level === 0) {
    await updateCandidatToken(id, newToken)
  }

  return newToken
}

export function checkToken (token) {
  return jwt.verify(token, config.secret)
}

const isTokenAlreadyValid = (token) => {
  if (!token) return false
  try {
    checkToken(token)
    return true
  } catch (error) {
    return false
  }
}
