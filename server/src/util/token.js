import jwt from 'jsonwebtoken'

import config from '../config'

export function createToken (id, userStatus, departements, status = undefined) {
  const level = config.userStatusLevels[userStatus] || 0
  const tokenExpiration = config[`${userStatus}TokenExpiration`]

  const payload = {
    id,
    level,
    departements,
    status,
  }

  const secret = config.secret

  const options = {
    expiresIn: tokenExpiration || 0,
  }

  // appLogger.debug({ action: 'create-token', payload, options })

  const token = jwt.sign(payload, secret, options)

  return token
}

export function checkToken (token) {
  return jwt.verify(token, config.secret)
}
