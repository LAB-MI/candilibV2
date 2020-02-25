/**
 * Ensemble des actions sur les évaluations dans la base de données
 * @module
 *
 */

import Evaluation from './evaluation-model'

/**
 * Crée une évaluation dans la base de données
 *
 * @async
 * @function
 *
 * @param {number} rating - Note
 * @param {string} comment - Commentaire
 *
 * @returns {Promise.<Evaluation~EvaluationMongooseDocument>} - L'évaluation créée
 */
export const createEvaluation = async ({ rating, comment }) => {
  try {
    const evaluation = new Evaluation({
      rating,
      comment,
    })
    await evaluation.save()
    return evaluation
  } catch (error) {
    throw new Error("Impossible d'enregistrer l'évaluation")
  }
}

/**
 * Récupère une évaluation par son id
 *
 * @async
 * @function
 *
 * @param {string} id - Id de l'évaluation
 *
 * @returns {Promise.<Evaluation~EvaluationMongooseDocument>} - L'évaluation correspondante
 */
export const findEvaluationById = id => Evaluation.findById(id)

/**
 * Supprime une évaluation de la base de données
 *
 * @async
 * @function
 *
 * @param id - Id de l'évaluation à supprimer
 *
 * @returns {Promise.<Evaluation~EvaluationMongooseDocument>} - L'évaluation supprimée
 */
export const deleteEvaluationById = async id => {
  const evaluation = await findEvaluationById(id)
  if (!evaluation) {
    throw new Error('No evaluation found with id')
  }
  await evaluation.delete()
  return evaluation
}

/**
 * Modifie une évaluation de la base de données
 *
 * @async
 * @function
 *
 * @param id - Id de l'évaluation à modifier
 * @param {number} rating - Note
 * @param {string} comment - Commentaire
 *
 * @returns {Promise.<Evaluation~EvaluationMongooseDocument>} - l'évaluation modifiée
 */
export const updateEvaluationById = async (id, { rating, comment }) => {
  const evaluation = await findEvaluationById(id)
  evaluation.rating = rating
  evaluation.comment = comment
  await evaluation.update()
  return evaluation
}
