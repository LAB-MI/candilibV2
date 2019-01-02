import jwt from 'jsonwebtoken'

import config from '../config'

export function verifyToken (req, res, next) {
  const authHeader = req.headers.authorization
  const tokenInAuthHeader = authHeader && authHeader.replace('Bearer ', '')
  const token = tokenInAuthHeader || req.query.token

  if (!token) {
    return res.status(401).send({
      message: 'Token absent',
      success: false,
    })
  }

  try {
    const decoded = jwt.verify(token, config.secret)
    const { level } = decoded
    req.userLevel = level
    next()
  } catch (err) {
    return res.status(401).send({
      isTokenValid: false,
      message: 'Token invalide',
      success: false,
    })
  }
}
