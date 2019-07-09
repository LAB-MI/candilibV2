import { connect, disconnect } from '../../mongo-connection'
import {
  createEvaluation,
  deleteEvaluationById,
  findEvaluationById,
  updateEvaluationById,
} from './evaluation.queries'

const rating = 5
const comment = 'chouette'

describe('Saving Evaluation', () => {
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  it.only('Create Evaluation', async () => {
    // Given
    const evaluationLean = { rating, comment }

    // When
    const evaluation = await createEvaluation(evaluationLean)

    // Then
    expect(evaluation.isNew).toBe(false)
    expect(evaluation.rating).toBe(rating)
    expect(evaluation.comment).toBe(comment)
    await deleteEvaluationById(evaluation.id)
  })
})

describe('Find Evaluation', () => {
  let evaluationId

  beforeAll(async () => {
    await connect()
    const evaluation = await createEvaluation({ rating, comment })
    evaluationId = evaluation.id
  })

  afterAll(async () => {
    await deleteEvaluationById(evaluationId)
    await disconnect()
  })

  it('Find evaluation by Id', async () => {
    // Given
    const id = evaluationId

    // When
    const evaluation = await findEvaluationById(id)

    // Then
    expect(evaluation).toBeDefined()
    expect(evaluation).not.toBeNull()
    expect(evaluation).toHaveProperty('rating', 5)
  })
})

describe('Update Evaluation', () => {
  let evaluationId

  beforeAll(async () => {
    await connect()
    const evaluation = await createEvaluation({ rating, comment })
    evaluationId = evaluation.id
  })

  afterAll(async () => {
    await deleteEvaluationById(evaluationId)
    await disconnect()
  })

  it('Update evaluation by Id', async () => {
    // Given
    const rating = 4
    const comment = 'cool'

    // When
    const evaluation = await updateEvaluationById(evaluationId, { rating, comment })

    // Then
    expect(evaluation).toBeDefined()
    expect(evaluation).toHaveProperty('rating', rating)
  })
})

describe('Delete Evaluation', () => {
  let evaluationId

  beforeAll(async () => {
    await connect()
    const evaluation = await createEvaluation({ rating, comment })
    evaluationId = evaluation.id
  })

  afterAll(async () => {
    await disconnect()
  })

  it('Delete evaluation by Id', async () => {
    // Given
    const id = evaluationId

    // When
    const evaluationFound = await findEvaluationById(id)
    // Delete it
    await deleteEvaluationById(id)
    const evaluationDeleted = await findEvaluationById(id)

    // Then
    expect(evaluationFound).toBeDefined()
    expect(evaluationFound).not.toBeNull()
    expect(evaluationDeleted).toBeNull()
  })
})
