import {
  createWhitelisted,
  deleteWhitelistedByEmail,
  deleteWhitelisted,
  findWhitelistedByEmail,
  findAllWhitelisted,
} from './whitelisted-queries'
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

    it('should save a whitelisted with a valid email with departement 93', async () => {
      // Given
      const email = validEmail
      const departement = '93'
      // When
      whitelisted = await createWhitelisted(email, departement)

      // Then
      expect(whitelisted.isNew).toBe(false)
      expect(whitelisted).toHaveProperty('email', email)
      expect(whitelisted).toHaveProperty('departement', departement)
    })

    it('should not save a whitelisted with an existing email', async () => {
      // Given
      const email = validEmail
      const departement = '93'

      whitelisted = await createWhitelisted(email, departement)

      // When
      const error = await createWhitelisted(email, '94').catch(error => error)

      // Then
      expect(whitelisted.isNew).toBe(false)
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toContain('duplicate key')
      expect(error.message).toContain(email)
    })

    it('should not save a whitelisted with an invalid email', async () => {
      // Given
      const email = invalidEmail
      const departement = '93'
      // When
      const error = await createWhitelisted(email, departement).catch(
        error => error
      )

      // Then
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toContain('Path `email` is invalid')
    })
  })

  describe('Deleting Whitelisted', () => {
    it('should delete a whitelisted', async () => {
      // Given
      const email = validEmail
      const departement = '93'
      whitelisted = await createWhitelisted(email, departement)

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
      const departement = '93'
      whitelisted = await createWhitelisted(email, departement)

      // When
      const deletedWhitelisted = await deleteWhitelistedByEmail(validEmail)
      const noWhitelisted = await findWhitelistedByEmail(
        deletedWhitelisted.email
      )

      // Then
      expect(noWhitelisted).toBe(null)
    })
  })

  describe('get list of whitelisted', () => {
    let createdWhitelisteds
    const listWhitelists = [
      { email: 'test93@test.test', departement: '93' },
      { email: 'test93_1@test.test', departement: '93' },
      { email: 'test92@test.test', departement: '92' },
      { email: 'test94@test.test', departement: '94' },
    ]
    beforeAll(async () => {
      createdWhitelisteds = await Promise.all(
        listWhitelists.map(({ email, departement }) =>
          createWhitelisted(email, departement)
        )
      )
    })
    afterAll(async () => {
      await Promise.all(
        createdWhitelisteds.map(whitelisted => whitelisted.remove())
      )
    })
    it('should get 2 whitelisted with departement 93', async () => {
      const list = await findAllWhitelisted('93')
      expect(list).toBeDefined()
      expect(list).toHaveLength(2)
      list.forEach(element => {
        expect(element.email).toMatch(/test93.{0,2}@test.test/)
      })
    })
    it('should get 0 whitelisted with departement 91', async () => {
      const list = await findAllWhitelisted('91')
      expect(list).toBeDefined()
      expect(list).toHaveLength(0)
    })
  })
})
