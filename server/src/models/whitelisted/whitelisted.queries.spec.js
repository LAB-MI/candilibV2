import {
  createWhitelisted,
  deleteWhitelistedByEmail,
  deleteWhitelisted,
  findWhitelistedByEmail,
} from '.'
import { connect, disconnect } from '../../mongo-connection'

const validEmail = 'dontusethis@example.com'
const anotherValidEmail = 'dontusethis@example.fr'
const invalidEmail = 'dontusethisexample.com'

describe('Whitelisted', () => {
  let whitelisted
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  describe('Saving Whitelisted', () => {
    afterEach(async () => {
      await Promise.all([
        deleteWhitelistedByEmail(validEmail).catch(() => true),
        deleteWhitelistedByEmail(anotherValidEmail).catch(() => true),
      ])
    })

    it('should save a whitelisted with a valid email', async () => {
      // Given
      const email = validEmail

      // When
      whitelisted = await createWhitelisted(email)

      // Then
      expect(whitelisted.isNew).toBe(false)
    })

    it('should not save a whitelisted with an existing email', async () => {
      // Given
      const email = validEmail
      whitelisted = await createWhitelisted(email)

      // When
      const error = await createWhitelisted(email).catch(error => error)

      // Then
      expect(whitelisted.isNew).toBe(false)
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toContain('duplicate key error')
      expect(error.message).toContain('email_1 dup key')
    })

    it('should not save a whitelisted with an invalid email', async () => {
      // Given
      const email = invalidEmail

      // When
      const error = await createWhitelisted(email).catch(error => error)

      // Then
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toContain('Path `email` is invalid')
    })
  })

  describe('Deleting Whitelisted', () => {
    it('should delete a whitelisted', async () => {
      // Given
      const email = validEmail
      whitelisted = await createWhitelisted(email)

      // When
      const deletedWhitelisted = await deleteWhitelisted(whitelisted)
      const noWhitelisted = await findWhitelistedByEmail(
        deletedWhitelisted.email
      )

      // Then
      expect(noWhitelisted).toBe(null)
    })

    it('should delete a whitelisted by its email', async () => {
      // Given
      const email = validEmail
      whitelisted = await createWhitelisted(email)

      // When
      const deletedWhitelisted = await deleteWhitelistedByEmail(validEmail)
      const noWhitelisted = await findWhitelistedByEmail(
        deletedWhitelisted.email
      )

      // Then
      expect(noWhitelisted).toBe(null)
    })
  })
})
