import {
  createInspecteur,
  deleteInspecteurByMatricule,
  deleteInspecteurById,
  findInspecteursMatching,
  findInspecteurById,
} from '.'
import { connect, disconnect } from '../../mongo-connection'
import {
  findInspecteurByMatricule,
  findAllInspecteurs,
} from './inspecteur-queries'
import { EMAIL_ALREADY_SET, EMAIL_EXISTE, INVALID_EMAIL_FOR } from './inspecteur.constants'

const validEmail = 'dontusethis@example.fr'
const anotherValidEmail = 'dontusethis@example.com'

const invalidEmail = 'dontusethisexamplefr'

let email = validEmail
let matricule = '153424'
let nom = 'Dupont'
let prenom = 'Jacques'
const defaultInspecteur = { email, matricule, nom, prenom }

email = anotherValidEmail
matricule = '153425'
nom = 'Dupond'
prenom = 'Jean'
const defaultInspecteur2 = { email, matricule, nom, prenom }

const validEmail2 = 'dontusethis@example2.fr'
const validEmail3 = 'dontusethis@example3.fr'

describe('Inspecteur', () => {
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  describe('Saving Inspecteur', () => {
    const testCreateInspeteurWithDuplicateSecondMail = async (inspecteur, email, isDoublons) => {
      try {
        const savedInspecteur = await createInspecteur(inspecteur)
        expect(savedInspecteur).toBeUndefined()
      } catch (error) {
        expect(error).toHaveProperty('message', isDoublons ? EMAIL_ALREADY_SET(email) : EMAIL_EXISTE(email))
      }
    }

    afterEach(async () => {
      await Promise.all([defaultInspecteur.matricule, defaultInspecteur2.matricule].map(
        matricule => deleteInspecteurByMatricule(matricule).catch(
          () => true,
        ),
      ))
    })

    it('should not save an inspecteur with invalid email', async () => {
      const inspecteur = {
        ...defaultInspecteur,
        secondEmail: [invalidEmail],
      }
      try {
        const savedInspecteur = await createInspecteur(inspecteur)
        expect(savedInspecteur).toBeUndefined()
      } catch (error) {
        expect(error).toHaveProperty('message', INVALID_EMAIL_FOR(invalidEmail))
      }
    })

    it.each([
      undefined,
      [validEmail2],
      [validEmail2, validEmail3],
    ])('should save an inspecteur with second e-mail which is: %s', async (secondEmail) => {
      const inspecteur = {
        ...defaultInspecteur,
        secondEmail,
      }
      const savedInspecteur = await createInspecteur(inspecteur)
      // Then
      expect(savedInspecteur).toHaveProperty('isNew', false)
      expectInspecteurFn(savedInspecteur, inspecteur)
    })

    it.each([
      { secondEmail: [validEmail] },
      { secondEmail: [validEmail2, validEmail2] },
    ])('should not save an inspecteur with second e-mail exist in info inspecteur: %j',
      async ({ secondEmail }) => {
        const inspecteur = {
          ...defaultInspecteur,
          secondEmail,
        }
        await testCreateInspeteurWithDuplicateSecondMail(inspecteur, secondEmail[0], true)
      },
    )

    it('should not save 2 inspecteurs with a second e-mail which is same e-mail of second inspecteur  ', async () => {
      await createInspecteur(defaultInspecteur2)

      const inspecteur = {
        ...defaultInspecteur,
        secondEmail: [defaultInspecteur2.email, 'dontusethis@example2.fr'],
      }
      await testCreateInspeteurWithDuplicateSecondMail(inspecteur, defaultInspecteur2.email)
    })

    it('should not save 2 inspecteurs with a e-mail which is same second e-mail of second inspecteur  ', async () => {
      const inspecteur2 = {
        ...defaultInspecteur2,
        secondEmail: [defaultInspecteur.email, 'dontusethis@example2.fr'],
      }
      await createInspecteur(inspecteur2)

      const inspecteur = { ...defaultInspecteur }
      await testCreateInspeteurWithDuplicateSecondMail(inspecteur, inspecteur.email)
    })

    it('should not save 2 inspecteurs with a second e-mail which is same second e-mail of second inspecteur  ', async () => {
      const inspecteur2 = {
        ...defaultInspecteur2,
        secondEmail: [defaultInspecteur.email, 'dontusethis@example2.fr'],
      }
      await createInspecteur(inspecteur2)

      const inspecteur = { ...defaultInspecteur, secondEmail: [defaultInspecteur.email] }
      await testCreateInspeteurWithDuplicateSecondMail(inspecteur, defaultInspecteur.email)
    })
  })

  describe('Deleting Inspecteur', () => {
    afterEach(async () => {
      await Promise.all([
        deleteInspecteurByMatricule(defaultInspecteur.matricule).catch(
          () => true,
        ),
      ])
    })

    it('should delete an inspecteur by matricule', async () => {
      // Given
      const inspecteur = defaultInspecteur
      const savedInspecteur = await createInspecteur(inspecteur)

      // When
      const beforeInspecteur = await findInspecteurByMatricule(
        savedInspecteur.matricule,
      )
      const removedInspecteur = await deleteInspecteurByMatricule(
        savedInspecteur.matricule,
      )
      const afterInspecteur = await findInspecteurByMatricule(
        removedInspecteur.matricule,
      )

      // Then
      expect(beforeInspecteur).toBeDefined()
      expect(removedInspecteur).toBeDefined()
      expect(afterInspecteur).toBeNull()
    })

    it('should delete an inspecteur by id', async () => {
      // Given
      const inspecteur = defaultInspecteur
      const savedInspecteur = await createInspecteur(inspecteur)

      // When
      const beforeInspecteur = await findInspecteurById(savedInspecteur.id)
      const removedInspecteur = await deleteInspecteurById(savedInspecteur.id)
      const afterInspecteur = await findInspecteurById(removedInspecteur.id)

      // Then
      expect(beforeInspecteur).toBeDefined()
      expect(removedInspecteur).toBeDefined()
      expect(afterInspecteur).toBeNull()
    })
  })

  describe('Find Inspecteur', () => {
    afterEach(async () => {
      await Promise.all([
        deleteInspecteurByMatricule(defaultInspecteur.matricule).catch(
          () => true,
        ),
        deleteInspecteurByMatricule(defaultInspecteur2.matricule).catch(
          () => true,
        ),
      ])
    })

    it('Find an inspecteur by id', async () => {
      // Given
      const inspecteur = defaultInspecteur
      const searchinspecteur = await createInspecteur(inspecteur)

      // When
      const foundInspecteur = await findInspecteurById(searchinspecteur._id)

      // Then
      expect(foundInspecteur).toBeDefined()
      expect(foundInspecteur).toHaveProperty('email', defaultInspecteur.email)
      expect(foundInspecteur).toHaveProperty(
        'matricule',
        defaultInspecteur.matricule,
      )
      expect(foundInspecteur).toHaveProperty(
        'nom',
        defaultInspecteur.nom.toUpperCase(),
      )
      expect(foundInspecteur).toHaveProperty('prenom', defaultInspecteur.prenom)
    })

    it('Find 2 inspecteurs', async () => {
      // Given
      await createInspecteur(defaultInspecteur)
      await createInspecteur(defaultInspecteur2)

      // When
      const foundInspecteurs = await findInspecteursMatching('Dupon')

      // Then
      expect(foundInspecteurs).toBeDefined()
      expect(foundInspecteurs).toHaveLength(2)
      expect(foundInspecteurs[0]).toHaveProperty(
        'email',
        defaultInspecteur.email,
      )
      expect(foundInspecteurs[0]).toHaveProperty(
        'matricule',
        defaultInspecteur.matricule,
      )
      expect(foundInspecteurs[0]).toHaveProperty(
        'nom',
        defaultInspecteur.nom.toUpperCase(),
      )
      expect(foundInspecteurs[0]).toHaveProperty(
        'prenom',
        defaultInspecteur.prenom,
      )
    })

    it('Find 1 inspecteur', async () => {
      // Given
      await createInspecteur(defaultInspecteur)
      await createInspecteur(defaultInspecteur2)

      // When
      const foundInspecteurs = await findInspecteursMatching(
        `${defaultInspecteur.nom} 153`,
      )

      // Then
      expect(foundInspecteurs).toBeDefined()
      expect(foundInspecteurs).toHaveLength(1)
      expect(foundInspecteurs[0]).toHaveProperty(
        'email',
        defaultInspecteur.email,
      )
      expect(foundInspecteurs[0]).toHaveProperty(
        'matricule',
        defaultInspecteur.matricule,
      )
      expect(foundInspecteurs[0]).toHaveProperty(
        'nom',
        defaultInspecteur.nom.toUpperCase(),
      )
      expect(foundInspecteurs[0]).toHaveProperty(
        'prenom',
        defaultInspecteur.prenom,
      )
    })

    it('Find 1 inspecteur', async () => {
      // Given
      await createInspecteur(defaultInspecteur)
      await createInspecteur(defaultInspecteur2)

      // When
      const foundInspecteurs = await findInspecteursMatching(
        `${defaultInspecteur.nom}`,
      )

      // Then
      expect(foundInspecteurs).toBeDefined()
      expect(foundInspecteurs).toHaveLength(1)
      expect(foundInspecteurs[0]).toHaveProperty(
        'email',
        defaultInspecteur.email,
      )
      expect(foundInspecteurs[0]).toHaveProperty(
        'matricule',
        defaultInspecteur.matricule,
      )
      expect(foundInspecteurs[0]).toHaveProperty(
        'nom',
        defaultInspecteur.nom.toUpperCase(),
      )
      expect(foundInspecteurs[0]).toHaveProperty(
        'prenom',
        defaultInspecteur.prenom,
      )
    })

    it('find all inspecteurs', async () => {
      // Given
      await createInspecteur(defaultInspecteur)
      await createInspecteur(defaultInspecteur2)

      const foundInspecteurs = await findAllInspecteurs()
      expect(foundInspecteurs).toBeDefined()
      expect(foundInspecteurs).toHaveLength(2)
    })
  })
})

function expectInspecteurFn (inspecteur, expectedInspecteur) {
  expect(inspecteur).toHaveProperty('nom', expectedInspecteur.nom.toUpperCase())
  expect(inspecteur).toHaveProperty('prenom', expectedInspecteur.prenom)
  expect(inspecteur).toHaveProperty('matricule', expectedInspecteur.matricule)
  expect(inspecteur).toHaveProperty('departement', expectedInspecteur.departement)
  expect(inspecteur).toHaveProperty('email', expectedInspecteur.email)
  expect(inspecteur.secondEmail).toEqual(expect.arrayContaining(expectedInspecteur.secondEmail || []))
}
