import {
  createUser,
  deleteUser,
  archiveUserByEmail,
  findUserByEmail,
  findUserById,
  updateUser,
  updateManyUser,
  findManyUser,
  updateUserEmail,
} from './'
import { connect, disconnect } from '../../mongo-connection'
import config from '../../config'
import { findAllActiveUsers } from './user.queries'

const validEmail = 'dontusethis@example.com'
const anotherValidEmail = 'dontusethis@example.fr'
const invalidEmail = 'dontusethisexample.com'
const emptyPassword = ''
const shortPassword = 'Abc1*'
const validPassword = 'Abcde12*'

describe('User', () => {
  describe('Getting User', () => {
    beforeAll(async () => {
      await connect()
    })

    afterAll(async () => {
      await disconnect()
    })

    it('Should return a user by id without status', async () => {
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

    it('Should return a user by id with status tech', async () => {
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
    const emailTwo = 'emailTwo@example.com'

    beforeAll(async () => {
      await connect()
    })

    afterAll(async () => {
      await disconnect()
    })

    afterEach(async () => {
      return Promise.all([
        findUserByEmail(validEmail)
          .then(deleteUser)
          .catch(() => true),
        findUserByEmail(anotherValidEmail)
          .then(deleteUser)
          .catch(() => true),
        findUserByEmail(emailTwo)
          .then(deleteUser)
          .catch(() => true),
      ])
    })

    it('Should not save a user with no password', async () => {
      // Given
      const email = validEmail

      // When
      const error = await createUser(email).catch(error => error)

      // Then
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toContain('`password` is required')
    })

    it('Should not save a user with an empty password', async () => {
      // Given
      const email = validEmail
      const password = emptyPassword

      // When
      const error = await createUser(email, password).catch(error => error)

      // Then
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toContain('`password` is required')
    })

    it('Should not save a user with a short password', async () => {
      // Given
      const email = validEmail
      const password = shortPassword

      // When
      const error = await createUser(email, password).catch(error => error)

      // Then
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('weak_password')
    })

    it('Should save a user with a valid email and a "strong" password', async () => {
      // Given
      const email = validEmail
      const password = validPassword

      // When
      const user = await createUser(email, password)

      // Then
      expect(user.isNew).toBe(false)
    })

    // Seems to be a problem with mongodb-memory-server handling of 'unique'
    xit('Should not save a user with an existing email', async () => {
      // Given
      const duplicatedEmail = 'duplicated-email@candi.lib'
      const password = validPassword
      const user = await createUser(
        duplicatedEmail,
        password,
        ['75'],
        'delegue'
      )

      // When
      const error = await createUser(
        duplicatedEmail,
        password,
        ['75'],
        'delegue'
      ).catch(error => error)

      // Then
      expect(user.isNew).toBe(false)
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toContain("l'email existe déjà")
    })

    it('Should not save a user with an invalid email', async () => {
      // Given
      const email = invalidEmail
      const password = validPassword

      // When
      const error = await createUser(email, password).catch(error => error)

      // Then
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('Retrieve Users', () => {
    const email = 'admin@example.com'
    const emailDelegue = 'delegue@example.com'
    const emailRepartiteur = 'repartiteur@example.com'
    const repartiteurToDeleteEmail = 'toDelete@email.fr'
    const password = '@85Stm9G!'
    const departements = ['75']
    let adminPromise
    let deleguePromise
    let repartiteurPromise
    let repartiteurToDeletePromise

    beforeAll(async () => {
      await connect()
      adminPromise = createUser(
        email,
        password,
        departements,
        config.userStatuses.ADMIN
      )
      deleguePromise = createUser(
        emailDelegue,
        password,
        departements,
        config.userStatuses.DELEGUE
      )
      repartiteurPromise = createUser(
        emailRepartiteur,
        password,
        departements,
        config.userStatuses.REPARTITEUR
      )
      repartiteurToDeletePromise = createUser(
        repartiteurToDeleteEmail,
        password,
        departements,
        config.userStatuses.REPARTITEUR
      )

      await Promise.all([
        adminPromise,
        deleguePromise,
        repartiteurPromise,
        repartiteurToDeletePromise,
      ])
      await archiveUserByEmail(repartiteurToDeleteEmail)
    })

    afterAll(async () => {
      await Promise.all([
        adminPromise.then(deleteUser).catch(() => true),
        deleguePromise.then(deleteUser).catch(() => true),
        repartiteurPromise.then(deleteUser).catch(() => true),
        repartiteurToDeletePromise.then(deleteUser).catch(() => true),
      ])
      await disconnect()
    })

    it('Should retrieve all users for admin session', async () => {
      // When
      const users = await findAllActiveUsers()

      // Then
      expect(users).toBeDefined()
      expect(users).toBeInstanceOf(Array)
      expect(users).toHaveLength(3)
    })

    it('Should retrieve all users from 75 or 93 for delegue session', async () => {
      // Given
      const departements = ['75', '93']
      const userStatus = config.userStatuses.DELEGUE
      const userLevel = config.userStatusLevels[userStatus]
      const allowedStatuses = config.userStatusesOrderedList.slice(0, userLevel)

      // When
      const users = await findAllActiveUsers(departements, allowedStatuses)

      // Then
      expect(users).toBeDefined()
      expect(users).toBeInstanceOf(Array)
      expect(users).toHaveLength(1)
    })

    it('Should update all users with status admin and tech', async () => {
      // Given
      const userStatus = [config.userStatuses.ADMIN, config.userStatuses.TECH]

      // when
      const updatedUsers = await updateManyUser(
        {
          status: {
            $in: userStatus,
          },
        },
        {
          $addToSet: { departements: ['94', '77'] },
        }
      )

      // Then
      expect(updatedUsers).toBeDefined()
      expect(updatedUsers).toBeInstanceOf(Object)
      expect(updatedUsers).toHaveProperty('n', 1)
      expect(updatedUsers).toHaveProperty('nModified', 1)
      expect(updatedUsers).toHaveProperty('ok', 1)
    })

    it('Should get all users with status admin and tech', async () => {
      // Given
      const userStatus = [config.userStatuses.ADMIN, config.userStatuses.TECH]
      const userShouldNotHaveStatus = [
        config.userStatuses.CANDIDAT,
        config.userStatuses.REPARTITEUR,
        config.userStatuses.DELEGUE,
      ]
      // when
      const foundUsers = await findManyUser({
        filterBy: 'status',
        inValue: userStatus,
      })

      // Then
      expect(foundUsers[0]).toBeDefined()
      expect(foundUsers[0]).toBeDefined()
      expect(foundUsers).toBeInstanceOf(Array)
      foundUsers.forEach(user => {
        expect(userShouldNotHaveStatus.includes(user.status)).toBeFalsy()
      })
      expect(foundUsers).toHaveProperty('length', 1)
    })
  })

  describe('Updating User', () => {
    const emailThree = 'emailThree@example.com'
    const emailFour = 'emailFour@example.com'

    beforeAll(async () => {
      await connect()
    })

    afterAll(async () => {
      await disconnect()
    })

    afterEach(async () => {
      await Promise.all([
        findUserByEmail(anotherValidEmail)
          .then(deleteUser)
          .catch(() => true),
        findUserByEmail(emailThree)
          .then(deleteUser)
          .catch(() => true),
        findUserByEmail(emailFour)
          .then(deleteUser)
          .catch(() => true),
      ])
    })

    it('Should update a user′s email', async () => {
      // Given
      const email = emailThree
      const password = validPassword
      const user = await createUser(email, password)

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

    it('Should update a user′s departement list', async () => {
      // Given
      const email = emailFour
      const password = validPassword
      const user = await createUser(email, password)
      const departements = ['75', '93']

      // When
      const sameUserWithDepartements = await updateUser(user.email, {
        departements,
      })

      // Then
      expect(sameUserWithDepartements).toBeDefined()
      expect(sameUserWithDepartements).toHaveProperty('departements')
      departements.forEach((departement, idx) => {
        expect(sameUserWithDepartements.departements[idx]).toEqual(departement)
      })
    })
  })

  describe('Deleting User', () => {
    const emailFive = 'emailFive@example.com'

    beforeAll(async () => {
      await connect()
    })

    afterAll(async () => {
      await disconnect()
    })

    afterEach(async () => {
      await Promise.all([
        findUserByEmail(anotherValidEmail)
          .then(deleteUser)
          .catch(() => true),
        findUserByEmail(emailFive)
          .then(deleteUser)
          .catch(() => true),
      ])
    })

    it('Should delete a user', async () => {
      // Given
      const email = emailFive
      const password = validPassword
      const user = await createUser(email, password)

      // When
      const deletedUser = await deleteUser(user)
      const noUser = await findUserByEmail(deletedUser.email)

      // Then
      expect(noUser).toBe(null)
    })

    it('Should archive a user by its email', async () => {
      // Given
      const email = 'terminator@example.com'
      const emailToDelete = 'emailFive@example.com'
      const password = validPassword
      await createUser(emailToDelete, password)

      // When
      await archiveUserByEmail(emailToDelete, email)
      const deletedUser = await findUserByEmail(emailToDelete)

      // Then
      expect(deletedUser).toBeInstanceOf(Object)
      expect(deletedUser).toHaveProperty('deletedAt')
      expect(deletedUser).toHaveProperty('deletedBy', email)
    })
  })
})
