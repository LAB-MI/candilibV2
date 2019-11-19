
import { connect } from '../../../mongo-connection'
import { disconnect } from 'mongoose'
import { createUser, findUserById, findUserByEmail } from '../../../models/user'
import { getAppropriateUsers, isForbiddenToUpsertUser } from './users'
import config from '../../../config'

describe('Users', () => {
  const email = 'admin@example.com'
  const emailDelegue = 'delegue@example.com'
  const emailRepartiteur = 'repartiteur@example.com'
  const password = '@85Stm9G!'
  const departements = ['75']
  let admin

  beforeAll(async () => {
    await connect()
    admin = await createUser(
      email,
      password,
      departements,
      config.userStatuses.ADMIN
    )
    await createUser(
      emailDelegue,
      password,
      departements,
      config.userStatuses.DELEGUE
    )
    await createUser(
      emailRepartiteur,
      password,
      departements,
      config.userStatuses.REPARTITEUR
    )
  })

  afterAll(async () => {
    await disconnect()
  })

  it('Should return users', async () => {
    // given
    const id = admin._id

    // when
    const users = await getAppropriateUsers(id)

    // then
    expect(users).toBeDefined()
    expect(users).toBeInstanceOf(Array)
    expect(users).toHaveProperty('length', 3)
  })

  it('Should be able to modify user if delegue', async () => {
    // given
    const delegue = await findUserByEmail(emailDelegue)
    const status = config.userStatuses.REPARTITEUR

    // when
    const result = isForbiddenToUpsertUser(status, delegue, departements)

    // then
    expect(result).toBeDefined()
    expect(result).toBe(false)
  })

  it('Should not be able to modify user if repartiteur', async () => {
    // given
    const repartiteur = await findUserByEmail(emailRepartiteur)
    const status = config.userStatuses.DELEGUE
    // when
    const result = isForbiddenToUpsertUser(status, repartiteur, departements)
    // then
    expect(result).toBeDefined()
    expect(result).toBe("Vous n'êtes pas autorisé à effectuer une action sur ce type d'utilisateur")
  })

  it('Should not be able to modify user of other departement', async () => {
    // given
    const delegue = await findUserByEmail(emailDelegue)
    const status = config.userStatuses.REPARTITEUR
    const departements = ['94']

    // When
    const result = isForbiddenToUpsertUser(status, delegue, departements)

    // then
    expect(result).toBeDefined()
    expect(result).toBe("La liste des départements d'intervention est incorrecte")
  })
})
