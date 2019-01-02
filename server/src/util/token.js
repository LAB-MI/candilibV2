import jwt from 'jsonwebtoken'

import config from '../config'

export function createToken (email, userStatus) {
  const token = jwt.sign(
    {
      email: email,
      level: config.USER_STATUS_LEVEL[userStatus] || 0,
    },
    config.secret,
    {
      expiresIn:
        config[`${userStatus}TokenExpiration`] === undefined
          ? '0'
          : config[`${userStatus}TokenExpiration`],
    }
  )

  return token
}

export function checkToken (token) {
  return jwt.verify(token, config.secret)
}
