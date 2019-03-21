import jwt from 'jsonwebtoken'

import config from '../config'
import { appLogger } from './logger'

export function createToken (id, userStatus) {
  const level = config.userStatusLevels[userStatus] || 0
  const tokenExpiration = config[`${userStatus}TokenExpiration`]
  let emailOrIdKey = id.includes('@') ? 'email' : 'id'

  const payload = {
    [emailOrIdKey]: id,
    level,
  }

  const secret = config.secret

  const options = {
    expiresIn: tokenExpiration || 0,
  }

  appLogger.debug({ action: 'create-token', payload, options })

  const token = jwt.sign(payload, secret, options)

  return token
}

export function checkToken (token) {
  return jwt.verify(token, config.secret)
}
