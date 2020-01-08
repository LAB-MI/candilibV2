import { connect, disconnect } from '../../mongo-connection'
import { createDepartement, findDepartementById } from '.'
import {
  deleteDepartementById,
  findDepartementsByEmail,
} from './departement.queries'

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
    await deleteDepartementById(departement._id)
  })
})

describe('Find Departement', () => {
  let departementId

  beforeAll(async () => {
    await connect()
    const departement = await createDepartement({ _id, email: validEmail })
    departementId = departement._id
  })

  afterAll(async () => {
    await disconnect()
    await deleteDepartementById(departementId)
  })

  it('Find departement by Id', async () => {
    // Given
    const id = _id

    // When
    const departement = await findDepartementById(id)

    // Then
    expect(departement).toBeDefined()
    expect(departement).not.toBeNull()
    expect(departement).toHaveProperty('email', validEmail)
  })

  it('Find departement by email', async () => {
    // Given
    const email = validEmail

    // When
    const departements = await findDepartementsByEmail(email)

    // Then
    expect(departements).toBeDefined()
    expect(departements).not.toBeNull()
    expect(departements).toHaveLength(1)
    expect(departements[0]).toHaveProperty('email', email)
  })
})
