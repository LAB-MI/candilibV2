import { connect, disconnect } from '../../mongo-connection'
import {
  createDepartement,
  findDepartementbyId,
} from '.'

const validEmail = 'candidat@example.com'
const _id = '95'

describe('Saving Departement', () => {
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  it('Create Departement', async () => {
    // Given
    const leanDepartement = { _id, email: validEmail }

    // When
    const departement = await createDepartement(leanDepartement)

    // Then
    expect(departement.isNew).toBe(false)
  })
})

describe('Find Departement', () => {
  beforeAll(async () => {
    await createDepartement()
  })

  it('Find departement by Id', async () => {
    // Given
    const departementResult = '93'

    // When
    const departement = await findDepartementbyId(departementResult)

    // Then
    expect(departement).toBeDefined()
  })
})
