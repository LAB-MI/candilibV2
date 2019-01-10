import jwt from 'jsonwebtoken'

import config from '../config'

export function createToken (id, userStatus) {
  const level = config.USER_STATUS_LEVEL[userStatus] || 0
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

  const token = jwt.sign(payload, secret, options)

  return token
}

export function checkToken (token) {
  return jwt.verify(token, config.secret)
}
