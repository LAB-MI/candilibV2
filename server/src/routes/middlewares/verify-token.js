import { checkToken } from '../../util'

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
    const decoded = checkToken(token)
    const { id, level } = decoded
    req.userId = id
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
