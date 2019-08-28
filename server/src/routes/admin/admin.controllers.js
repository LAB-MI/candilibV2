import { findUserById } from '../../models/user'
import { findDepartementById } from '../../models/departement'
import { appLogger } from '../../util'
import config from '../../config'

export const getMe = async (req, res) => {
  const loggerInfo = {
    section: 'admin-me',
    action: 'get-me',
    admin: req.userId,
  }
  appLogger.info(loggerInfo)
  try {
    const infoAdmin = await findInfoAdminById(req.userId)
    if (infoAdmin) {
      return res.json(infoAdmin)
    }
    appLogger.warn({
      ...loggerInfo,
      description: 'Utilisateur non trouvé',
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error,
    })
  }
  res.status(401).send({
    message: 'Accès interdit',
    success: false,
  })
}

const findInfoAdminById = async userId => {
  const { email, departements, status } = await findUserById(userId)
  if (!email || !departements || !status) {
    return
  }
  const emailsDepartements = await Promise.all(
    departements.map(findDepartementById)
  )

  const features = config.userStatusFeatures[status]

  return {
    email,
    departements,
    features,
    emailsDepartements,
  }
}
