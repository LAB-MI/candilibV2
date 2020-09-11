/**
 * Contrôleur regroupant les fonctions traitant des inspecteurs à l'attention des répartiteurs
 * @module routes/admin/inspecteurs-controllers
 */
import {
  findInspecteursMatching,
  findInspecteursByDepartement,
  findInspecteurById,
  createInspecteur,
} from '../../models/inspecteur'
import { findAllPlacesByCentre } from '../../models/place'
import {
  appLogger,
  email as emailRegex,
  matricule as matriculeRegex,
  getFrenchLuxonFromISO,
} from '../../util'
import {
  getInspecteursBookedFromDepartement,
  isUserAllowedToCreateIpcsr,
  isUserAllowedToUpdateIpcsr,
  updateInspecteur,
  getAllAppropriateActiveInspecteurs,
  isInspecteurBooked,
} from './inspecteurs-business'

/**
 * Récupère les informations d'un ou plusieurs inspecteurs
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId - Id de l'utilisateur faisant la requête
 *
 * @param {Object} req.query
 * @param {string} req.query.matching - Une chaîne de caractères pour chercher un inspecteur
 * @param {string} req.query.departement - S'il s'agit du seul paramètre entré, retourne tous les inspecteurs du département
 * @param {string} req.query.centreId - Remplir pour chercher les inspecteurs affectés à un centre pendant une période donnée
 * @param {string} req.query.begin - Début de la période de recherche d'inspecteurs affectés à un centre
 * @param {string} req.query.end - Fin de la période de recherche d'inspecteurs affectés à un centre
 *
 * @param {import('express').Response} res
 */
export const getInspecteurs = async (req, res) => {
  const {
    matching,
    departement,
    centreId,
    begin,
    end,
    date,
    startingWith,
    endingWith,
  } = req.query
  const userId = req.userId

  const loggerInfo = {
    section: 'admin-get-inspecteur',
    admin: userId,
    matching,
    departement,
    centreId,
    begin,
    end,
    startingWith,
    endingWith,
  }

  if (date && departement && !matching && !centreId && !begin && !end) {
    const results = await getInspecteursBookedFromDepartement(date, departement)

    appLogger.info({
      ...loggerInfo,
      nbInspecteurs: results.length,
    })

    return res.status(200).json({
      success: true,
      results,
    })
  }

  if (departement && !matching && !centreId && !begin && !end && !date) {
    // obtenir la liste des inspecteurs par département
    try {
      loggerInfo.action = 'get-by-departement'
      appLogger.info(loggerInfo)

      const inspecteurs = await findInspecteursByDepartement(departement)
      appLogger.info({
        ...loggerInfo,
        description:
          "nombre d'inspecteurs trouvé est " + inspecteurs
            ? inspecteurs.length
            : 0,
      })
      return res.json(inspecteurs)
    } catch (error) {
      appLogger.error({ ...loggerInfo, description: error.message, error })

      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  if (matching && !centreId && !begin && !end && !date) {
    // Recherche un inspecteur
    try {
      loggerInfo.action = 'get-by-matching'
      appLogger.info(loggerInfo)

      const inspecteurs = await findInspecteursMatching(
        matching,
        startingWith,
        endingWith,
      )
      appLogger.info({
        ...loggerInfo,
        description:
          "nombre d'inspecteurs trouvé est " + inspecteurs
            ? inspecteurs.length
            : 0,
      })
      return res.json(inspecteurs)
    } catch (error) {
      appLogger.error({ ...loggerInfo, description: error.message, error })
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  if (centreId && begin && end && !date) {
    try {
      loggerInfo.action = 'get-inspecteur-by-list-ids'
      appLogger.info(loggerInfo)
      const beginDate = getFrenchLuxonFromISO(begin).toISO()
      const endDate = getFrenchLuxonFromISO(end).toISO()
      const places = await findAllPlacesByCentre(centreId, beginDate, endDate)

      const inspecteursIdList = places.reduce((accu, value) => {
        if (!accu.includes(value.inspecteur.toString())) {
          accu.push(`${value.inspecteur}`)
          return accu
        }
        return accu
      }, [])
      const inspecteurs = await Promise.all(
        inspecteursIdList.map(findInspecteurById),
      )
      appLogger.info({
        ...loggerInfo,
        description:
          "nombre d'inspecteurs trouvé est " + inspecteurs
            ? inspecteurs.length
            : 0,
      })
      return res.json(inspecteurs)
    } catch (error) {
      appLogger.error({ ...loggerInfo, description: error.message, error })
      return res.status(500).json({
        success: false,
        message: error.message,
        error,
      })
    }
  }

  try {
    const ipcsr = await getAllAppropriateActiveInspecteurs(userId)
    return res.status(200).json({
      success: true,
      ipcsr,
    })
  } catch (error) {
    appLogger.error({ ...loggerInfo, description: error.message, error })
    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    })
  }
}

/**
 * Crée un nouvel IPCSR dans la base de données Candilib
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId - Id de l'utilisateur faisant la requête
 *
 * @param {Object} req.query
 * @param {string} req.query.departement - Département d'intervention de l'IPCSR à créer
 * @param {string} req.query.nom - Nom de l'IPCSR à créer
 * @param {string} req.query.prenom - Prénom de l'IPCSR à créer
 * @param {string} req.query.matricule - Matricule de l'IPCSR à créer
 *
 * @param {import('express').Response} res
 */
export const createIpcsr = async (req, res) => {
  const { departement, email, matricule, nom, prenom } = req.body
  const userId = req.userId

  if ([departement, email, matricule, nom, prenom].some(w => !w)) {
    return res.status(400).json({
      success: false,
      message: 'Tous les champs sont obligatoires',
    })
  }

  const loggerInfo = {
    section: 'admin-get-inspecteur',
    admin: userId,
    departement,
    email,
    nom,
    matricule,
    prenom,
  }

  const isAllowed = await isUserAllowedToCreateIpcsr(userId, departement)

  if (!isAllowed) {
    appLogger.warn({
      ...loggerInfo,
      description: `Utilisateur non autorisé à créer un IPCSR dans le ${departement}`,
    })
    return res.status(403).json({
      success: false,
      message: "Vous n'êtes pas autorisé à créer un IPCSR dans ce département",
    })
  }

  try {
    const ipcsr = await createInspecteur({
      departement,
      email,
      matricule,
      nom,
      prenom,
    })

    return res.status(201).json({
      success: true,
      ipcsr,
    })
  } catch (error) {
    let message = error.message
    let status = 500

    if (message.includes('duplicate')) {
      status = 409
      if (message.includes('matricule')) {
        message = `Ce matricule existe déjà : ${matricule}`
      }
      if (message.includes('email')) {
        message = `Cette adresse courriel existe déjà : ${email}`
      }
    }

    return res.status(status).json({
      success: false,
      message,
    })
  }
}

/**
 * Modifie un nouvel IPCSR dans la base de données Candilib
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId - Id de l'utilisateur faisant la requête
 *
 * @param {Object} req.params
 * @param {string} req.params.id - Id de l'IPCSR à modifier
 *
 * @param {Object} req.body
 * @param {boolean} req.body.active - État actif ou non de l'IPCSR à modifier
 * @param {string} req.body.departement - Département d'intervention de l'IPCSR à modifier
 * @param {string} req.body.nom - Nom de l'IPCSR à modifier
 * @param {string} req.body.prenom - Prénom de l'IPCSR à modifier
 * @param {string} req.body.matricule - Matricule de l'IPCSR à modifier
 *
 * @param {import('express').Response} res
 */
export const updateIpcsr = async (req, res) => {
  const {
    active,
    departement = '',
    email = '',
    matricule = '',
    nom = '',
    prenom = '',
  } = req.body
  const userId = req.userId
  const { id: ipcsrId } = req.params

  const fieldsWithErrors = checkIpcsrData(req.body)

  if (fieldsWithErrors.length) {
    return res.status(400).json({
      success: false,
      message: `Des champs sont incorrects : ${fieldsWithErrors.join(', ')}`,
    })
  }

  const loggerInfo = {
    section: 'admin-update-inspecteur',
    admin: userId,
    ipcsrId,
    departement,
    email,
    nom,
    matricule,
    prenom,
  }

  const isAllowed = await isUserAllowedToUpdateIpcsr(
    userId,
    ipcsrId,
    departement,
  )

  if (!isAllowed) {
    appLogger.warn({
      ...loggerInfo,
      description: `Utilisateur non autorisé à modifier cet IPCSR ${ipcsrId}`,
    })
    return res.status(403).json({
      success: false,
      message: `Vous n'êtes pas autorisé à modifier cet IPCSR ${prenom} ${nom} ${matricule} (${ipcsrId})`,
    })
  }

  if (typeof active === 'boolean') {
    if (active === false && (await isInspecteurBooked(ipcsrId)).length) {
      return res.status(409).json({
        success: false,
        message:
          "Impossible d'archiver cet inspecteur : il est associé à des places d'examens",
      })
    }

    try {
      const ipcsr = await updateInspecteur(ipcsrId, { active })
      return res.status(200).json({
        success: true,
        ipcsr,
      })
    } catch (error) {
      let message = error.message
      let status = 500

      if (message.includes('duplicate')) {
        status = 409
        if (message.includes('matricule')) {
          message = `Ce matricule existe déjà : ${matricule}`
        }
        if (message.includes('email')) {
          message = `Cette adresse courriel existe déjà : ${email}`
        }
      }

      return res.status(status).json({
        success: false,
        message,
      })
    }
  }

  const ipcsr = await updateInspecteur(ipcsrId, {
    email,
    departement,
    matricule,
    nom,
    prenom,
  })

  return res.status(200).json({
    success: true,
    ipcsr,
  })
}

const mandatoryIpcsrFields = [
  'departement',
  'email',
  'matricule',
  'nom',
  'prenom',
]

function checkIpcsrData (ipcsrData) {
  const fieldsWithErrors = mandatoryIpcsrFields
    .map(key => (ipcsrData[key] ? '' : key))
    .filter(e => e)

  const isValidEmail = emailRegex.test(ipcsrData.email)
  const isValidMatricule = matriculeRegex.test(ipcsrData.matricule)

  if (!isValidEmail && !fieldsWithErrors.includes('email')) {
    fieldsWithErrors.push('email')
  }

  if (!isValidMatricule && !fieldsWithErrors.includes('matricule')) {
    fieldsWithErrors.push('matricule')
  }

  return fieldsWithErrors
}
