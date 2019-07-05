import {
  createUser,
  deleteUser,
  deleteUserByEmail,
  findUserByEmail,
  findUserById,
  updateUserDepartements,
  updateUserEmail,
} from './'
import { connect, disconnect } from '../../mongo-connection'
import config from '../../config'

const validEmail = 'dontusethis@example.com'
const anotherValidEmail = 'dontusethis@example.fr'
const invalidEmail = 'dontusethisexample.com'
const emptyPassword = ''
const shortPassword = 'Abc1*'
const validPassword = 'Abcde12*'

describe('User', () => {
  let user
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  describe('Getting User', () => {
    it('should return a user by id without status', async () => {
      // Given
      const expectedEmail = 'test@example.com'
      const password = 'S3cr3757uff!'
      const expectedDepartements = ['75', '93']
      const expectedStatus = config.userStatuses.ADMIN
      const admin = await createUser(
        expectedEmail,
        password,
        expectedDepartements
      )

      // When
      const { email, departements, status } = await findUserById(admin._id)

      //  Then
      expect(email).toBe(expectedEmail)
      expect(departements).toHaveLength(expectedDepartements.length)
      expect(status).toBe(expectedStatus)
    })
    it('should return a user by id with status tech', async () => {
      // Given
      const expectedEmail = 'test1@example.com'
      const password = 'S3cr3757uff!'
      const expectedDepartements = ['94', '95']
      const expectedStatus = config.userStatuses.TECH
      const admin = await createUser(
        expectedEmail,
        password,
        expectedDepartements,
        expectedStatus
      )

      // When
      const { email, departements, status } = await findUserById(admin._id)

      //  Then
      expect(email).toBe(expectedEmail)
      expect(departements).toHaveLength(expectedDepartements.length)
      expect(status).toBe(expectedStatus)
    })
  })

  describe('Saving User', () => {
    afterEach(async () => {
      await Promise.all([
        deleteUserByEmail(validEmail).catch(() => true),
        deleteUserByEmail(anotherValidEmail).catch(() => true),
      ])
    })

    it('should not save a user with no password', async () => {
      // Given
      const email = validEmail

      // When
      const error = await createUser(email).catch(error => error)

      // Then
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toContain('`password` is required')
    })

    it('should not save a user with an empty password', async () => {
      // Given
      const email = validEmail
      const password = emptyPassword

      // When
      const error = await createUser(email, password).catch(error => error)

      // Then
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toContain('`password` is required')
    })

    it('should not save a user with a short password', async () => {
      // Given
      const email = validEmail
      const password = shortPassword

      // When
      const error = await createUser(email, password).catch(error => error)

      // Then
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('weak_password')
    })

    it('should save a user with a valid email and a "strong" password', async () => {
      // Given
      const email = validEmail
      const password = validPassword

      // When
      user = await createUser(email, password)

      // Then
      expect(user.isNew).toBe(false)
    })

    it('should not save a user with an existing email', async () => {
      // Given
      const email = validEmail
      const password = validPassword
      user = await createUser(email, password)

      // When
      const error = await createUser(email, 'Abcdefgh2*').catch(error => error)

      // Then
      expect(user.isNew).toBe(false)
      expect(error).toBeInstanceOf(Error)
    })

    it('should not save a user with an invalid email', async () => {
      // Given
      const email = invalidEmail
      const password = validPassword

      // When
      const error = await createUser(email, password).catch(error => error)

      // Then
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('Updating User', () => {
    afterEach(async () => {
      await Promise.all([
        deleteUserByEmail(anotherValidEmail).catch(() => true),
        deleteUserByEmail(validEmail).catch(() => true),
      ])
    })

    it('should update a user′s email', async () => {
      // Given
      const email = validEmail
      const password = validPassword
      user = await createUser(email, password)

      // When
      const sameUserDifferentEmail = await updateUserEmail(
        user,
        anotherValidEmail
      )

      // Then
      expect(sameUserDifferentEmail).toBeDefined()
      expect(sameUserDifferentEmail._id.toString()).toBe(user._id.toString())
      expect(sameUserDifferentEmail.email).not.toBe(user.email)
    })

    it('should update a user′s departement list', async () => {
      // Given
      const email = validEmail
      const password = validPassword
      user = await createUser(email, password)
      const departements = ['75', '93']

      // When
      const sameUserWithDepartements = await updateUserDepartements(
        user,
        departements
      )

      // Then
      expect(sameUserWithDepartements).toBeDefined()
      expect(sameUserWithDepartements).toHaveProperty('departements')
      departements.forEach((departement, idx) => {
        expect(sameUserWithDepartements.departements[idx]).toEqual(departement)
      })
    })
  })

  describe('Deleting User', () => {
    it('should delete a user', async () => {
      // Given
      const email = validEmail
      const password = validPassword
      user = await createUser(email, password)

      // When
      const deletedUser = await deleteUser(user)
      const noUser = await findUserByEmail(deletedUser.email)

      // Then
      expect(noUser).toBe(null)
    })

    it('should delete a user by its email', async () => {
      // Given
      const email = validEmail
      const password = validPassword
      user = await createUser(email, password)

      // When
      const deletedUser = await deleteUserByEmail(validEmail)
      const noUser = await findUserByEmail(deletedUser.email)

      // Then
      expect(noUser).toBe(null)
    })
  })
})
