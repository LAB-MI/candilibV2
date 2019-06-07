import { findUserById } from '../../models/user'
import { appLogger } from '../../util'

export const getMe = async (req, res) => {
  const loggerInfo = {
    section: 'admin-me',
    action: 'get-me',
    user: req.userId,
  }
  appLogger.info(loggerInfo)
  try {
    const { email, departements } = await findUserById(req.userId)
    appLogger.debug({
      ...loggerInfo,
      results: { email, departements },
    })
    if (!email || !departements) {
      const error = new Error('Utilisateur non trouvé')
      throw error
    }
    return res.json({
      email,
      departements,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      message: error.message,
      error,
    })
    res.status(401).send({
      message: 'Accès interdit',
      success: false,
    })
  }
}
