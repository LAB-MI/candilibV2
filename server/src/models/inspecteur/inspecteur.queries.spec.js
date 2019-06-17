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
} from './inspecteur.queries'

const validEmail = 'dontusethis@example.fr'
const anotherValidEmail = 'dontusethis@example.com'

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

describe('User', () => {
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  describe('Saving Inspecteur', () => {
    afterEach(async () => {
      await Promise.all([
        deleteInspecteurByMatricule(defaultInspecteur.matricule).catch(
          () => true
        ),
      ])
    })

    it('should save an inspecteur', async () => {
      // Given
      const inspecteur = defaultInspecteur

      // When
      const savedInspecteur = await createInspecteur(inspecteur)

      // Then
      expect(savedInspecteur).toHaveProperty('isNew', false)
    })
  })

  describe('Deleting Inspecteur', () => {
    afterEach(async () => {
      await Promise.all([
        deleteInspecteurByMatricule(defaultInspecteur.matricule).catch(
          () => true
        ),
      ])
    })

    it('should delete an inspecteur by matricule', async () => {
      // Given
      const inspecteur = defaultInspecteur
      const savedInspecteur = await createInspecteur(inspecteur)

      // When
      const beforeInspecteur = await findInspecteurByMatricule(
        savedInspecteur.matricule
      )
      const removedInspecteur = await deleteInspecteurByMatricule(
        savedInspecteur.matricule
      )
      const afterInspecteur = await findInspecteurByMatricule(
        removedInspecteur.matricule
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
          () => true
        ),
        deleteInspecteurByMatricule(defaultInspecteur2.matricule).catch(
          () => true
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
        defaultInspecteur.matricule
      )
      expect(foundInspecteur).toHaveProperty(
        'nom',
        defaultInspecteur.nom.toUpperCase()
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
        defaultInspecteur.email
      )
      expect(foundInspecteurs[0]).toHaveProperty(
        'matricule',
        defaultInspecteur.matricule
      )
      expect(foundInspecteurs[0]).toHaveProperty(
        'nom',
        defaultInspecteur.nom.toUpperCase()
      )
      expect(foundInspecteurs[0]).toHaveProperty(
        'prenom',
        defaultInspecteur.prenom
      )
    })

    it('Find 1 inspecteur', async () => {
      // Given
      await createInspecteur(defaultInspecteur)
      await createInspecteur(defaultInspecteur2)

      // When
      const foundInspecteurs = await findInspecteursMatching(
        `${defaultInspecteur.nom} 153`
      )

      // Then
      expect(foundInspecteurs).toBeDefined()
      expect(foundInspecteurs).toHaveLength(1)
      expect(foundInspecteurs[0]).toHaveProperty(
        'email',
        defaultInspecteur.email
      )
      expect(foundInspecteurs[0]).toHaveProperty(
        'matricule',
        defaultInspecteur.matricule
      )
      expect(foundInspecteurs[0]).toHaveProperty(
        'nom',
        defaultInspecteur.nom.toUpperCase()
      )
      expect(foundInspecteurs[0]).toHaveProperty(
        'prenom',
        defaultInspecteur.prenom
      )
    })

    it('Find 1 inspecteur', async () => {
      // Given
      await createInspecteur(defaultInspecteur)
      await createInspecteur(defaultInspecteur2)

      // When
      const foundInspecteurs = await findInspecteursMatching(
        `${defaultInspecteur.nom}`
      )

      // Then
      expect(foundInspecteurs).toBeDefined()
      expect(foundInspecteurs).toHaveLength(1)
      expect(foundInspecteurs[0]).toHaveProperty(
        'email',
        defaultInspecteur.email
      )
      expect(foundInspecteurs[0]).toHaveProperty(
        'matricule',
        defaultInspecteur.matricule
      )
      expect(foundInspecteurs[0]).toHaveProperty(
        'nom',
        defaultInspecteur.nom.toUpperCase()
      )
      expect(foundInspecteurs[0]).toHaveProperty(
        'prenom',
        defaultInspecteur.prenom
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
