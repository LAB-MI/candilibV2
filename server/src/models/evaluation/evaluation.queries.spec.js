import { connect, disconnect } from '../../mongo-connection'
import {
  createEvaluation,
  deleteEvaluationById,
  findEvaluationById,
  updateEvaluationById,
} from './evaluation.queries'

const note = 5
const comment = 'chouette'

describe('Saving Evaluation', () => {
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  it('Create Evaluation', async () => {
    // Given
    const evaluationLean = { note, comment }

    // When
    const evaluation = await createEvaluation(evaluationLean)

    // Then
    expect(evaluation.isNew).toBe(false)
    await deleteEvaluationById(evaluation.id)
  })
})

describe('Find Evaluation', () => {
  let evaluationId

  beforeAll(async () => {
    await connect()
    const evaluation = await createEvaluation({ note, comment })
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
    expect(evaluation).toHaveProperty('note', 5)
  })
})

describe('Update Evaluation', () => {
  let evaluationId

  beforeAll(async () => {
    await connect()
    const evaluation = await createEvaluation({ note, comment })
    evaluationId = evaluation.id
  })

  afterAll(async () => {
    await deleteEvaluationById(evaluationId)
    await disconnect()
  })

  it('Update evaluation by Id', async () => {
    // Given
    const note = 4
    const comment = 'cool'

    // When
    const evaluation = await updateEvaluationById(evaluationId, { note, comment })

    // Then
    expect(evaluation).toBeDefined()
    expect(evaluation).toHaveProperty('note', note)
  })
})

describe('Delete Evaluation', () => {
  let evaluationId

  beforeAll(async () => {
    await connect()
    const evaluation = await createEvaluation({ note, comment })
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
