/**
 * Gestion des IPCSR au niveau de la base de données
 *
 * @module
 */

import Inspecteur from './inspecteur-model'
import { inspecteurValidator } from './inspecteur-validator'

/**
 * Crée un IPCSR dans la base de données
 *
 * @async
 * @function
 *
 * @param {param} - Object contenant les données de l'inspecteur à créer
 * @param {param.email} - Adresse courriel de l'inspecteur à créer
 * @param {param.matricule} - Matricule de l'inspecteur à créer
 * @param {param.nom} - Nom de l'inspecteur à créer
 * @param {param.prenom} - Prénom de l'inspecteur à créer
 * @param {param.departement} - Département d'intervention de l'inspecteur à créer
 *
 * @returns {Promise.<InspecteurMongooseDocument>} - Objet mongoose de l'inspecteur créé
 */
export const createInspecteur = async ({
  email,
  matricule,
  nom,
  prenom,
  departement,
  secondEmail,
}) => {
  const validated = await inspecteurValidator.validateAsync({
    email,
    matricule,
    nom,
    prenom,
    departement,
  })

  if (validated.error) throw new Error(validated.error)

  const inspecteur = new Inspecteur({
    email,
    matricule,
    nom,
    prenom,
    departement,
    secondEmail,
  })
  await inspecteur.save()
  return inspecteur
}

/**
 * Récupère la liste de tous les IPCSR
 *
 * @async
 * @function
 *
 * @param {string} departement - Identifiant du département
 *
 * @returns {Promise.<InspecteurMongooseDocument[]>} - Liste d'objets mongoose de tous les IPCSR
 */
export const findAllInspecteurs = async () => {
  const inspecteurs = await Inspecteur.find()
  return inspecteurs
}

/**
 * Récupère un IPCSR par son identifiant
 *
 * @async
 * @function
 *
 * @param {string} id - Identifiant de l'IPCSR
 *
 * @returns {Promise.<InspecteurMongooseDocument>} - Objet mongoose de l'IPCSR
 */
export const findInspecteurById = async id => Inspecteur.findById(id)

/**
 * Récupère un IPCSR par son matricule
 *
 * @async
 * @function
 *
 * @param {string} matricule
 *
 * @returns {Promise.<InspecteurMongooseDocument>} - Objet mongoose de l'IPCSR
 */
export const findInspecteurByMatricule = async matricule =>
  Inspecteur.findOne({ matricule })

/**
 * Récupère la liste des IPCSR intervenant dans un département (passé en paramètre)
 *
 * @async
 * @function
 *
 * @param {string} departement - Identifiant du département
 *
 * @returns {Promise.<InspecteurMongooseDocument[]>} - Liste d'objets mongoose des IPCSR correspondants
 */
export const findInspecteursByDepartement = async departement =>
  Inspecteur.find({ departement })

/**
 * Récupère la liste des IPCSR intervenant dans une liste de départements (passée en paramètre)
 *
 * @async
 * @function
 *
 * @param {string[]} departement - Liste d'identifiants de départements
 *
 * @returns {Promise.<InspecteurMongooseDocument[]>} - Liste d'objets mongoose des IPCSR correspondants
 */
export const findInspecteursByDepartements = async departements =>
  Inspecteur.find({ departement: { $in: departements } })

/**
 * Récupère la liste des IPCSR actifs intervenant dans une liste de départements (passée en paramètre)
 *
 * @async
 * @function
 *
 * @param {string[]} departements - Liste d'identifiants de départements
 *
 * @returns {Promise.<InspecteurMongooseDocument[]>} - Liste d'objets mongoose des IPCSR correspondants
 */
export const findActiveInspecteursByDepartements = async departements =>
  Inspecteur.find({
    departement: { $in: departements },
    active: { $ne: false },
  })

/**
 * Récupère la liste des IPCSR correspondants à une recherche (dans les noms, prénoms, adresses courriel et matricules)
 *
 * @async
 * @function
 *
 * @param {string} $search - Chaîne de caractère à rechercher
 *
 * @returns {Promise.<InspecteurMongooseDocument[]>} - Liste d'objets mongoose des IPCSR correspondants
 */
export const findInspecteursMatching = async (
  $search,
  startingWith,
  endingWith,
) => {
  const search = `${startingWith ? '^' : ''}${$search}${endingWith ? '$' : ''}`
  const searchRegex = new RegExp(`${search}`, 'i')
  const inspecteurs = await Inspecteur.find({
    $or: [
      { nom: searchRegex },
      { prenom: searchRegex },
      { matricule: searchRegex },
      { email: searchRegex },
    ],
  })

  const fullTextInspecteurs = await Inspecteur.find(
    { $text: { $search } },
    { score: { $meta: 'textScore' } },
  ).sort({ score: { $meta: 'textScore' } })

  return [
    ...inspecteurs,
    ...fullTextInspecteurs.filter(
      inspecteur =>
        !inspecteurs.some(
          ins => ins._id.toString() === inspecteur._id.toString(),
        ),
    ),
  ]
}

/**
 * Récupère l'IPCSR par ses prénom et nom
 *
 * @async
 * @function
 *
 * @param {string} prenom - Prénom de l'IPCSR à rechercher
 * @param {string} nom - Nom de l'IPCSR à rechercher
 *
 * @returns {Promise.<InspecteurMongooseDocument>} - Objet mongoose de l'IPCSR correspondant
 */
export const findInspecteurByName = async (prenom, nom) => {
  const inspecteur = {}
  if (nom) {
    inspecteur.nom = nom
  }
  if (prenom) {
    inspecteur.prenom = prenom
  }
  return Inspecteur.findOne(inspecteur)
}

/**
 * Récupère l'IPCSR par son email
 *
 * @async
 * @function
 *
 * @param {string} email - Adresse courriel de l'IPCSR à rechercher
 *
 * @returns {Promise.<InspecteurMongooseDocument>} - Objet mongoose de l'IPCSR correspondant
 */
export const findInspecteurByEmail = async email =>
  Inspecteur.findOne({ $or: [{ email }, { secondEmail: email }] })

/**
 * Supprime l'IPCSR de la base de données à partir de son matricule
 *
 * @async
 * @function
 *
 * @param {string} matricule - Matricule de l'IPCSR à supprimer
 *
 * @returns {Promise.<InspecteurMongooseDocument>} - Objet mongoose de l'IPCSR supprimé
 */
export const deleteInspecteurByMatricule = async matricule => {
  const inspecteur = await findInspecteurByMatricule(matricule)
  if (!inspecteur) {
    throw new Error(`No inspecteur found with matricule ${matricule}`)
  }
  await inspecteur.delete()
  return inspecteur
}

/**
 * Supprime l'IPCSR de la base de données à partir de son identifiant
 *
 * @async
 * @function
 *
 * @param {string} id - Identifiant de l'IPCSR à supprimer
 *
 * @returns {Promise.<InspecteurMongooseDocument>} - Objet mongoose de l'IPCSR supprimé
 */
export const deleteInspecteurById = async id => {
  const inspecteur = await findInspecteurById(id)
  if (!inspecteur) {
    throw new Error(`No inspecteur found with id ${id}`)
  }
  await inspecteur.delete()
  return inspecteur
}

/**
 * Modifie un IPCSR à partir de son identifiant
 *
 * @async
 * @function
 *
 * @param {string} ipcsrId - Identifiant de l'IPCSR à modifier
 *
 * @returns {Promise.<InspecteurMongooseDocument>} - Objet mongoose de l'IPCSR modifié
 */
export const updateIpcsr = (ipcsrId, newData) => {
  return Inspecteur.findByIdAndUpdate(ipcsrId, newData, { new: true })
}

/**
 * Désactuve un IPCSR à partir de son identifiant
 *
 * @async
 * @function
 *
 * @param {string} ipcsrId - Identifiant de l'IPCSR à modifier
 *
 * @returns {Promise.<InspecteurMongooseDocument>} - Objet mongoose de l'IPCSR modifié
 */
export const disableIpcsr = ipcsrId => {
  return Inspecteur.findByIdAndUpdate(ipcsrId, { active: false })
}
