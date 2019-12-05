import Evaluation from './evaluation.model'

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

export const findEvaluationById = id => Evaluation.findById(id)

export const deleteEvaluationById = async id => {
  const evaluation = await findEvaluationById(id)
  if (!evaluation) {
    throw new Error('No evaluation found with id')
  }
  await evaluation.delete()
  return evaluation
}

export const updateEvaluationById = async (id, { rating, comment }) => {
  const evaluation = await findEvaluationById(id)
  evaluation.rating = rating
  evaluation.comment = comment
  await evaluation.update()
  return evaluation
}
