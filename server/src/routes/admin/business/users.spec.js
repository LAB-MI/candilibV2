import { connect } from '../../../mongo-connection'
import { disconnect } from 'mongoose'
import { createUser, findUserByEmail } from '../../../models/user'
import {
  getAppropriateUsers,
  isForbiddenToUpsertUser,
  updateUserBusiness,
  deleteUserBusiness,
  createAppropriateUser,
} from './users'
import config from '../../../config'

describe('Users', () => {
  const email = 'admin@example.com'
  const emailDelegue = 'delegue@example.com'
  const emailRepartiteur = 'repartiteur@example.com'
  const newDelegue = 'newDelegue@example.com'
  const password = '@85Stm9G!'
  const departements = ['75']
  let admin
  let delegue
  let repartiteur

  beforeAll(async () => {
    await connect()
    admin = await createUser(
      email,
      password,
      departements,
      config.userStatuses.ADMIN
    )
    delegue = await createUser(
      emailDelegue,
      password,
      departements,
      config.userStatuses.DELEGUE
    )
    repartiteur = await createUser(
      emailRepartiteur,
      password,
      departements,
      config.userStatuses.REPARTITEUR
    )
  })

  afterAll(async () => {
    await disconnect()
  })

  it('Should create Delegue if Admin', async () => {
    // given
    const adminId = admin.id
    const status = config.userStatuses.DELEGUE

    // when
    const saveUser = await createAppropriateUser(
      adminId,
      newDelegue,
      status,
      departements
    )

    // then
    expect(saveUser).toBeDefined()
    expect(saveUser).toBeInstanceOf(Object)
    expect(saveUser).toHaveProperty('_id')
    expect(saveUser).toHaveProperty('status', status)
    expect(saveUser.departements[0]).toBe(departements[0])
  })

  it('Should not create user delegue if delegue', async () => {
    // given
    const delegueId = delegue.id
    const status = config.userStatuses.DELEGUE

    // when
    const error = await createAppropriateUser(
      delegueId,
      emailDelegue,
      status,
      departements
    ).catch(error => error)

    // then
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('status', 401)
    expect(error).toHaveProperty(
      'message',
      "Vous n'êtes pas autorisé à effectuer une action sur ce type d'utilisateur"
    )
  })

  it('Should not create delegue if departements are different', async () => {
    // given
    const delegueId = delegue.id
    const status = config.userStatuses.REPARTITEUR
    const departements = ['78']

    // when
    const error = await createAppropriateUser(
      delegueId,
      emailRepartiteur,
      status,
      departements
    ).catch(error => error)

    // then
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('status', 401)
    expect(error).toHaveProperty(
      'message',
      "La liste des départements d'intervention est incorrecte"
    )
  })

  it('Should not create delegue to delegue', async () => {
    // given
    const delegueId = delegue.id
    const status = config.userStatuses.DELEGUE

    // when
    const error = await createAppropriateUser(
      delegueId,
      emailDelegue,
      status,
      departements
    ).catch(error => error)

    // then
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('status', 401)
    expect(error).toHaveProperty(
      'message',
      "Vous n'êtes pas autorisé à effectuer une action sur ce type d'utilisateur"
    )
  })

  it('Should not create delegue to repartiteur', async () => {
    // given
    const repartiteurId = repartiteur.id
    const status = config.userStatuses.DELEGUE

    // when
    const error = await createAppropriateUser(
      repartiteurId,
      emailDelegue,
      status,
      departements
    ).catch(error => error)

    // then
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('status', 401)
    expect(error).toHaveProperty(
      'message',
      "Vous n'êtes pas autorisé à effectuer une action sur ce type d'utilisateur"
    )
  })

  it('Should return users', async () => {
    // given
    const id = admin.id

    // when
    const users = await getAppropriateUsers(id)

    // then
    expect(users).toBeDefined()
    expect(users).toBeInstanceOf(Array)
    expect(users).toHaveProperty('length', 4)
  })

  it('Should be able to modify user if delegue', async () => {
    // given
    const delegue = await findUserByEmail(emailDelegue)
    const status = config.userStatuses.ADMIN

    // when
    const result = isForbiddenToUpsertUser(status, delegue, departements)

    // then
    expect(result).toBeDefined()
    expect(result).toBe(
      "Vous n'êtes pas autorisé à effectuer une action sur ce type d'utilisateur"
    )
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
    expect(result).toBe(
      "Vous n'êtes pas autorisé à effectuer une action sur ce type d'utilisateur"
    )
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
    expect(result).toBe(
      "La liste des départements d'intervention est incorrecte"
    )
  })

  it('Should update user', async () => {
    // given
    const adminId = admin.id
    const status = config.userStatuses.DELEGUE

    // when
    const updatedUser = await updateUserBusiness(
      adminId,
      emailRepartiteur,
      status,
      departements
    )

    // then
    expect(updatedUser).toBeDefined()
    expect(updatedUser).toBeInstanceOf(Object)
    expect(updatedUser).toHaveProperty('_id')
    expect(updatedUser).toHaveProperty('status', status)
    expect(updatedUser.departements[0]).toBe(departements[0])
  })

  it('Should not update delegue if email does not exist', async () => {
    // given
    const delegueId = delegue.id
    const status = config.userStatuses.DELEGUE

    // when
    const error = await updateUserBusiness(
      delegueId,
      'doesnotexist@example.com',
      status,
      departements
    ).catch(error => error)

    // then
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('status', 404)
    expect(error).toHaveProperty('message', "Cet utilisateur n'existe pas")
  })

  it('Should not update delegue if delegue', async () => {
    // given
    const delegueId = delegue.id
    const status = config.userStatuses.DELEGUE

    // when
    const error = await updateUserBusiness(
      delegueId,
      emailDelegue,
      status,
      departements
    ).catch(error => error)

    // then
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('status', 401)
    expect(error).toHaveProperty(
      'message',
      "Vous n'êtes pas autorisé à effectuer une action sur ce type d'utilisateur"
    )
  })

  it('Should not update delegue if departements are different', async () => {
    // given
    const delegueId = delegue.id
    const status = config.userStatuses.REPARTITEUR
    const departements = ['78']

    // when
    const error = await updateUserBusiness(
      delegueId,
      emailRepartiteur,
      status,
      departements
    ).catch(error => error)

    // then
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('status', 401)
    expect(error).toHaveProperty(
      'message',
      "La liste des départements d'intervention est incorrecte"
    )
  })

  it('Should not update repartiteur to delegue', async () => {
    // given
    const delegueId = delegue.id
    const status = config.userStatuses.DELEGUE

    // when
    const error = await updateUserBusiness(
      delegueId,
      emailRepartiteur,
      status,
      departements
    ).catch(error => error)

    // then
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('status', 401)
    expect(error).toHaveProperty(
      'message',
      "Vous n'êtes pas autorisé à effectuer une action sur ce type d'utilisateur"
    )
  })

  it('Should not update delegue to repartiteur', async () => {
    // given
    const delegueId = delegue.id
    const status = config.userStatuses.REPARTITEUR

    // when
    const error = await updateUserBusiness(
      delegueId,
      emailDelegue,
      status,
      departements
    ).catch(error => error)

    // then
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('status', 401)
    expect(error).toHaveProperty(
      'message',
      "Vous n'êtes pas autorisé à effectuer une action sur ce type d'utilisateur"
    )
  })

  it('Should archive user', async () => {
    // given
    const adminId = admin.id

    // when
    const deletedUser = await deleteUserBusiness(adminId, emailDelegue)

    // then
    expect(deletedUser).toBeDefined()
    expect(deletedUser).toBeInstanceOf(Object)
    expect(deletedUser).toHaveProperty('deletedAt')
    expect(deletedUser).toHaveProperty('deletedBy')
  })

  it('Should not archive delegue if email does not exist', async () => {
    // given
    const delegueId = delegue.id
    const status = config.userStatuses.DELEGUE

    // when
    const error = await updateUserBusiness(
      delegueId,
      'doesnotexist@example.com',
      status,
      departements
    ).catch(error => error)

    // then
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('status', 404)
    expect(error).toHaveProperty('message', "Cet utilisateur n'existe pas")
  })

  it('Should not archive user delegue if delegue', async () => {
    // given
    const delegueId = delegue.id
    const status = config.userStatuses.DELEGUE

    // when
    const error = await deleteUserBusiness(
      delegueId,
      emailDelegue,
      status,
      departements
    ).catch(error => error)

    // then
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('status', 401)
    expect(error).toHaveProperty(
      'message',
      "Vous n'êtes pas autorisé à effectuer une action sur ce type d'utilisateur"
    )
  })

  it('Should not archive delegue if repartiteur has different departements', async () => {
    // given
    const delegueId = delegue.id
    const status = config.userStatuses.REPARTITEUR
    const departements = ['78']

    // when
    const error = await updateUserBusiness(
      delegueId,
      emailRepartiteur,
      status,
      departements
    ).catch(error => error)

    // then
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('status', 401)
    expect(error).toHaveProperty(
      'message',
      "La liste des départements d'intervention est incorrecte"
    )
  })

  it('Should not archive delegue if delegue', async () => {
    // given
    const delegueId = delegue.id
    const status = config.userStatuses.DELEGUE

    // when
    const error = await deleteUserBusiness(
      delegueId,
      emailDelegue,
      status,
      departements
    ).catch(error => error)

    // then
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('status', 401)
    expect(error).toHaveProperty(
      'message',
      "Vous n'êtes pas autorisé à effectuer une action sur ce type d'utilisateur"
    )
  })

  it('Should not archive delegue if repartiteur', async () => {
    // given
    const repartiteurId = repartiteur.id
    const status = config.userStatuses.DELEGUE

    // when
    const error = await deleteUserBusiness(
      repartiteurId,
      emailDelegue,
      status,
      departements
    ).catch(error => error)

    // then
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('status', 401)
    expect(error).toHaveProperty(
      'message',
      "Vous n'êtes pas autorisé à effectuer une action sur ce type d'utilisateur"
    )
  })
})
