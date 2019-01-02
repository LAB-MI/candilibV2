import config from '../config'

export function verifyAdminLevel (req, res, next) {
  try {
    const userLevel = req.userLevel
    if (userLevel === config.USER_STATUS_LEVEL.admin) {
      return next()
    }
    throw new Error('Accès interdit')
  } catch (err) {
    return res.status(403).send({
      isTokenValid: false,
      message: 'Accès interdit',
      success: false,
    })
  }
}
