import User from './user.model'
import uuidv4 from 'uuid/v4'

/**
 * Recherche tous les répartiteurs/délégués de tous les départements
 *
 *
 * @returns {Promise.<import('./user.model.js').User[]>} - Liste de documents de l'utilisateur
 */
export const findAllUsers = async () => {
  const users = await User.find()
  return users
}

/**
 * Recherche tous les répartiteurs/délégués actifs (non archivés) de tous les départements
 *
 * @param {string[]} [departements] - Liste des départements des utilisateurs à retourner
 *                                   Si cette liste n'est pas définie, la fonction retourne
 *                                   les utilisateurs de tous les départements
 * @param {string} [status] - Statut maximum
 *
 * @returns {Promise.<import('./user.model.js').User[]>} - Liste de documents d'utilisateurs
 */
export const findAllActiveUsers = async (departements, statuses) => {
  const filters = { deletedAt: { $exists: false } }

  if (departements) {
    filters.departements = { $in: departements }
  }

  if (statuses) {
    filters.status = { $in: statuses }
  }

  const users = await User.find(filters)
  return users
}

/**
 * Recherche et retourne le document de l'utilisateur par son ID
 *
 * @param {string} id - ID mongo de l'utilisateur
 *
 * @returns {Promise.<User>} - Document de l'utilisateur
 */
export const findUserById = async id => {
  const user = await User.findById(id)
  return user
}

/**
 * Recherche et retourne le document de l'utilisateur par son adresse courriel
 *
 * @param {string} email - L'adresse courriel de l'utilisateur
 * @param {boolean} populatePassword
 *
 * @returns {Promise.<User>} - Document de l'utilisateur
 */
export const findUserByEmail = async (email, populatePassword) => {
  const query = User.findOne({ email })

  if (populatePassword) {
    return query.select('+password').exec()
  }

  return query.exec()
}

/**
 * Recherche et retourne le document de l'utilisateur par son adresse courriel et son mot de passe
 *
 * @param {string} email - L'adresse courriel de l'utilisateur
 *
 * @returns {Promise.<User>} - Document de l'utilisateur
 */
export const findUserByCredentials = async (email, password) => {
  const user = await findUserByEmail(email, true)
  if (!user) {
    return undefined
  }
  const isValidCredentials = user.comparePassword(password)
  if (!isValidCredentials) {
    return null
  }
  return user
}

/**
 * Crée un nouvel utilisateur
 *
 * @param {string} email - L'adresse courriel de l'utilisateur
 * @param {string} password - Mot de passe de l'utilisateur
 * @param {string} departements - Départements d'intervention de l'utilisateur
 * @param {string} status - Statut de l'utilisateur (délégué ou répartiteur)
 *
 * @returns {Promise.<User>} - Document de l'utilisateur
 */
export const createUser = async (email, password, departements, status) => {
  try {
    const user = new User({ email, password, departements, status })
    await user.save()
    return user
  } catch (error) {
    if (error.message.match(/duplicate key error.*\bemail_/)) {
      const message = "l'email existe déjà"
      const err = new Error(`Impossible de créer l'utilisateur : ${message}`)
      err.status = 409
      throw err
    }
    throw error
  }
}

/**
 * Archive l'utilisateur trouvé par son adresse courriel
 *
 * @param {string} emailToDelete - L'adresse courriel de l'utilisateur à supprimer
 * @param {string} email - L'adresse courriel de l'utilisateur demandant la suppression
 *
 * @returns {Promise.<User>} - Document de l'utilisateur archivé
 */
export const archiveUserByEmail = async (emailToDelete, email) => {
  const user = await findUserByEmail(emailToDelete)
  if (!user) {
    throw new Error('No user found')
  }
  user.deletedAt = new Date()
  user.deletedBy = email
  await user.save()
  return user
}

/**
 * Supprime l'utilisateur définitivement
 *
 * @param {User} user - Utilisateur à supprimer
 *
 * @returns {Promise.<User>} - Document de l'utilisateur supprimé
 */
export const deleteUser = async user => {
  if (!user) {
    throw new Error('No user given')
  }
  await user.delete()
  return user
}

/**
 * Remplace l'adresse courriel existante de l'utilisateur
 *
 * @async
 * @function
 *
 * @param {User} user - Le document user de l'utilisateur à modifier
 * @param {string} email - La nouvelle adresse courriel de l'utilisateur
 *
 * @returns {Promise.<User>} - Le document utilisateur modifié
 */
export const updateUserEmail = async (user, email) => {
  if (!user) {
    throw new Error('user is undefined')
  }
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { email },
    { new: true }
  )
  return updatedUser
}

/**
 * Remplace le mot de passe existant de l'utilisateur
 *
 * @async
 * @function
 *
 * @param {User} user - Le document user de l'utilisateur à modifier
 * @param {string} password - Le nouveau mot de passe de l'utilisateur
 *
 * @returns {Promise.<User>} - Le document utilisateur modifié
 */
export const updateUserPassword = async (user, password) => {
  const now = Date.now()
  const passwordResetRequestedAt = user.passwordResetRequestedAt
  const difference = now - passwordResetRequestedAt
  const fifteenMinutes = 15 * 60 * 1000
  if (difference > fifteenMinutes) {
    const error = new Error(
      'Votre lien a expiré, veuillez refaire votre demande de réinitialisation de mot de passe'
    )
    error.status = 401
    throw error
  }
  user.password = password
  await user.save()
  return user
}

/**
 * Remplace la liste de départements et/ou le statut de
 * l'utilisateur trouvé par son adresse courriel, et renvoie l'utilisateur modifié
 *
 * @async
 * @function
 *
 * @param {string} email - Adresse courriel de l'utilisateur à modifier
 * @param {Object} param - Les données à modifier
 * @param {string[]} param.departements - La nouvelle liste de départements d'intervention
 *                                      de l'utilisateur
 * @param {string} param.status - Le nouveau statut de l'utilisateur (délégué ou répartiteur)
 *
 * @returns {Promise.<User>} - Le document utilisateur modifié
 */
export const updateUser = async (email, { departements, status }) => {
  const updatedUser = await User.findOneAndUpdate(
    { email }, // filter
    { departements, status }, // update
    { new: true } // Return the updated document
  )
  return updatedUser
}

/**
 * Permet de mettre à jour plusieurs utilisateurs
 *
 * @async
 * @function
 *
 * @param {Object} filter - Adresse courriel de l'utilisateur à modifier
 * @param {Object} valueToSet - Les données à modifier
 *
 * @returns {Promise.<object>} - Un  object contenant le nombre de user modifier
 */
export const updateManyUser = async (filter, valueToSet) => {
  const updatedUsers = await User.updateMany(filter, valueToSet)

  return updatedUsers
}

/**
 * Permet de récuperer plusieurs utilisateurs en fonction d'un filtre
 *
 * @async
 * @function
 *
 * @param {Object} filter - Adresse courriel de l'utilisateur à modifier
 *
 * @returns {Promise.<Array>} - Un  tableau d'object User
 */
export const findManyUser = async ({ filterBy, inValue }) => {
  const foundedUsers = await User.find({
    [filterBy]: {
      $in: [...inValue],
    },
  })
  return foundedUsers
}

/**
 * Retourne un email contenant un lien avec un hash
 * @async
 * @function
 *
 * @param {string} email - L'adresse courriel de l'utilisateur
 *
 * @returns {Promise.<string>} - Hash de validation de l'email
 */
export const addEmailValidationHash = async email => {
  const emailValidationHash = uuidv4()
  const user = await findUserByEmail(email)
  user.emailValidationHash = emailValidationHash
  user.passwordResetRequestedAt = new Date()
  await user.save()
  return emailValidationHash
}
