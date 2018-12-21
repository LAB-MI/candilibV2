import User from './user'
import { connect, disconnect } from '../mongo-connection'

describe('Creating user', () => {
  let user, secondUser
  beforeAll(async () => {
    await connect()
  })

  it('should not save a user with an invalid email', async () => {
    try {
      // Given
      user = new User({ email: 'dontusethisexample.com' })

      // When
      await user.save()
    } catch (error) {
      // Then
      expect(error).toBeDefined()
    }
  })

  it('should not save a user with an empty password', async () => {
    try {
      // Given
      user = new User({ email: 'dontusethis@example.com' })

      // When
      await user.save()
    } catch (error) {
      // Then
      expect(error).toBeDefined()
    }
  })

  it('should not save a user with a short password', async () => {
    try {
      // Given
      user = new User({ email: 'dontusethis@example.com' })

      // When
      await user.save()
    } catch (error) {
      // Then
      expect(error).toBeDefined()
    }
  })

  it('should save a user with a valid email and a "strong" password', async () => {
    try {
      // Given
      user = new User({
        email: 'dontusethis@example.com',
        password: 'Abcdefgh1*',
      })

      // When
      await user.save()

      // Then
      expect(user.isNew).toBe(false)
    } catch (error) {
      expect(error).toBeUndefined()
    }
  })

  it('should save a user with a valid email and a "strong" password', async () => {
    try {
      // Given
      user = new User({
        email: 'dontusethis@example.com',
        password: 'Abcdefgh1*',
      })

      // When
      await user.save()
      secondUser = new User({
        email: 'dontusethis@example.com',
        password: 'Abcdefgh2*',
      })
      await secondUser.save()

      // Then
      expect(user.isNew).toBe(false)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  afterEach(async () => {
    if (!user.isNew) {
      await user.delete()
    }
    if (secondUser && !secondUser.isNew) {
      await secondUser.delete()
    }
  })

  afterAll(async () => {
    await disconnect()
  })
})
