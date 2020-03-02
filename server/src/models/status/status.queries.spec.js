import { connect, disconnect } from '../../mongo-connection'
import {
  createStatus,
  deleteStatusById,
  deleteStatusByType,
  findStatusById,
  findStatusByType,
  updateStatusById,
  upsertStatusByType,
} from './status.queries'

const type = 'AURIGE_STATUS'
const message = 'sync aurige status etape 1'

describe('Saving Status', () => {
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  it('Upsert Status by type', async () => {
    // Given
    const statusLean = { type, message }

    // When
    const status = await upsertStatusByType(statusLean)
    // Then
    expect(status).toHaveProperty('n', 1)
    expect(status).toHaveProperty('nModified', 0)
    expect(status).toHaveProperty('upserted')
    expect(status).toHaveProperty('ok', 1)
    await deleteStatusById(status.upserted[0]._id)
  })
})

describe('Upsert Status after already create', () => {
  beforeAll(async () => {
    await connect()
    await createStatus({ type, message })
  })

  afterAll(async () => {
    await deleteStatusByType(type)
    await disconnect()
  })

  it('Upsert Status', async () => {
    // Given
    const statusLean = { type, message }

    // When
    const status = await upsertStatusByType(statusLean)
    // Then
    expect(status).toHaveProperty('n', 1)
    expect(status).toHaveProperty('nModified', 1)
    expect(status).toHaveProperty('ok', 1)
  })
})

describe('Find Status', () => {
  let statusId

  beforeAll(async () => {
    await connect()
    const status = await createStatus({ type, message })
    statusId = status.id
  })

  afterAll(async () => {
    await deleteStatusById(statusId)
    await disconnect()
  })

  it('Find status by Id', async () => {
    // Given
    const id = statusId

    // When
    const status = await findStatusById(id)
    // Then
    expect(status).toBeDefined()
    expect(status).not.toBeNull()
    expect(status).toHaveProperty('type', type)
    expect(status).toHaveProperty('message', message)
    expect(status).toHaveProperty('createdAt')
    expect(status).toHaveProperty('updatedAt')
  })

  it('Find status by Type', async () => {
    // When
    const status = await findStatusByType({ type })
    // Then
    expect(status).toBeDefined()
    expect(status).not.toBeNull()
    expect(status).toHaveProperty('type', type)
    expect(status).toHaveProperty('message', message)
    expect(status).toHaveProperty('createdAt')
    expect(status).toHaveProperty('updatedAt')
  })
})

describe('Update Status', () => {
  let statusId

  beforeAll(async () => {
    await connect()
    const status = await createStatus({ type, message })
    statusId = status.id
  })

  afterAll(async () => {
    await deleteStatusById(statusId)
    await disconnect()
  })

  it('Update status by Id', async () => {
    // When
    const status = await updateStatusById(statusId, {
      type,
      message,
    })

    // Then
    expect(status).toBeDefined()
    expect(status).toHaveProperty('n', 1)
    expect(status).toHaveProperty('nModified', 1)
    expect(status).toHaveProperty('ok', 1)
  })
})

describe('Delete Status', () => {
  let statusId

  beforeAll(async () => {
    await connect()
    const status = await createStatus({ type, message })
    statusId = status.id
  })

  afterAll(async () => {
    await disconnect()
  })

  it('Delete status by Id', async () => {
    // Given
    const id = statusId

    // When
    const statusFound = await findStatusById(id)
    // Delete it
    await deleteStatusById(id)
    const statusDeleted = await findStatusById(id)

    // Then
    expect(statusFound).toBeDefined()
    expect(statusFound).not.toBeNull()
    expect(statusDeleted).toBeNull()
  })
})
