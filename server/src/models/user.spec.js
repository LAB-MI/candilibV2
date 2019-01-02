import {
  createUser,
  updateUserEmail,
  deleteUserByEmail,
  deleteUser,
  findUserByEmail,
} from './user'
import { connect, disconnect } from '../mongo-connection'

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
      expect(error.message).toBe('weak_password')
    })

    it('should not save a user with an empty password', async () => {
      // Given
      const email = validEmail
      const password = emptyPassword

      // When
      const error = await createUser(email, password).catch(error => error)

      // Then
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('weak_password')
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
