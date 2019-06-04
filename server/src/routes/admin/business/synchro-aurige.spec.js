import fs from 'fs'
import path from 'path'
import util from 'util'
import config from '../../../config'
import { findArchivedCandidatByNomNeph } from '../../../models/archived-candidat/archived-candidat.queries'
import { createCandidat, findCandidatById } from '../../../models/candidat'
import candidatModel from '../../../models/candidat/candidat.model'
import { deletePlace, findPlaceById } from '../../../models/place'
import { createCentres, removeCentres } from '../../../models/__tests__/centres'
import { createInspecteurs } from '../../../models/__tests__/inspecteurs'
import { createPlaces, removePlaces } from '../../../models/__tests__/places'
import { makeResa } from '../../../models/__tests__/reservations'
import { connect, disconnect } from '../../../mongo-connection'
import {
  EPREUVE_PRATIQUE_OK,
  OK_UPDATED,
  getFrenchLuxonDateTime,
  getFrenchLuxonDateTimeFromISO,
} from '../../../util'
import { REASON_EXAM_FAILED } from '../../common/reason.constants'
import {
  isEpreuveEtgInvalid,
  isETGExpired,
  isMoreThan2HoursAgo,
  synchroAurige,
} from './synchro-aurige'
import { toAurigeJsonBuffer } from './__tests__/aurige'
import candidats from './__tests__/candidats'
import {
  candidatFailureExam,
  candidatPassed,
  createCandidatToTestAurige,
} from './__tests__/candidats-aurige'
import {
  createTestPlaceAurige,
  placeAfterTimeOutRetry,
  placeBeforTimeOutRetry,
} from './__tests__/places-aurige'

jest.mock('../../../util/logger')
jest.mock('../../business/send-mail')

const readFileAsPromise = util.promisify(fs.readFile)

describe('synchro-aurige', () => {
  beforeAll(async () => {
    await connect()
  })
  afterAll(async () => {
    await disconnect()
  })
  it('Should return expired', () => {
    const fiveYearsAgo = new Date()
    fiveYearsAgo.setFullYear(new Date().getFullYear() - 5)
    fiveYearsAgo.setHours(new Date().getHours() - 1)

    const isExpired = isETGExpired(fiveYearsAgo)

    expect(isExpired).toBe(true)
  })

  it('Should return not expired', () => {
    const almostFiveYearsAgo = new Date()
    almostFiveYearsAgo.setFullYear(new Date().getFullYear() - 4)

    const isExpired = isETGExpired(almostFiveYearsAgo)

    expect(isExpired).toBe(false)
  })

  it('Should return valid for ISO date String', () => {
    const validDate = new Date().toISOString()

    const isInvalid = isEpreuveEtgInvalid(validDate)

    expect(isInvalid).toBe(false)
  })

  it('Should return invalid', () => {
    const validDate = new Date()

    const isInvalid = isEpreuveEtgInvalid(validDate)

    expect(isInvalid).toBe(true)
  })

  it('Should return invalid', () => {
    const invalidDate = 'OK'

    const isInvalid = isEpreuveEtgInvalid(invalidDate)

    expect(isInvalid).toBe(true)
  })

  it('Should return false for date now', () => {
    const lessThan2HoursAgo = new Date()

    const isExpired = isMoreThan2HoursAgo(lessThan2HoursAgo)

    expect(isExpired).toBe(false)
  })

  it('Should return true for date more than 2 hours ago', () => {
    const moreThan2HoursAgo = getFrenchLuxonDateTime()
      .minus(
        2 * 60 * 60 * 1000 + 10000 //  A little more than 2h
      )
      .toJSDate()

    const isExpired = isMoreThan2HoursAgo(moreThan2HoursAgo)

    expect(isExpired).toBe(true)
  })

  it('Should return true for date way back in the passed', () => {
    const lessThan2HoursAgo = getFrenchLuxonDateTime(2018).toJSDate()

    const isExpired = isMoreThan2HoursAgo(lessThan2HoursAgo)

    expect(isExpired).toBe(true)
  })

  it('Should return false for date less than 2 hours ago', () => {
    const lessThan2HoursAgo = getFrenchLuxonDateTime()
      .minus(
        2 * 60 * 60 * 1000 - 10000 //  A little less than 2h
      )
      .toJSDate()

    const isExpired = isMoreThan2HoursAgo(lessThan2HoursAgo)

    expect(isExpired).toBe(false)
  })

  describe('check candidats have valided their email', () => {
    let candidatsToCreate
    let aurigeFile

    beforeAll(async () => {
      candidatsToCreate = candidats.map(candidat => createCandidat(candidat))
      const candidatsCreated = await Promise.all(candidatsToCreate)

      candidatsCreated[0].isValidatedEmail = true
      await candidatsCreated[0].save()

      candidatsCreated[1].presignedUpAt = getFrenchLuxonDateTime()
        .minus(
          2 * 60 * 60 * 1000 + 10000 // A little more than 2h
        )
        .toJSDate()
      await candidatsCreated[1].save()

      candidatsCreated[2].presignedUpAt = getFrenchLuxonDateTime()
        .minus(
          2 * 60 * 60 * 1000 - 10000 // A little less than 2h
        )
        .toJSDate()
      await candidatsCreated[2].save()

      aurigeFile = await readFileAsPromise(
        path.resolve(__dirname, './', '__tests__', 'aurige.json')
      )
    })

    afterAll(async () => {
      await Promise.all(
        candidatsToCreate.map(candidat =>
          candidatModel.findByIdAndDelete(candidat._id)
        )
      )
    })

    it('Should return ', async () => {
      const result = await synchroAurige(aurigeFile)

      expect(result[0]).toHaveProperty('details', 'OK')
      expect(result[1]).toHaveProperty('details', 'EMAIL_NOT_VERIFIED_EXPIRED')
      expect(result[2]).toHaveProperty('details', 'EMAIL_NOT_VERIFIED_YET')
    })
  })

  describe('With a candidat failed', () => {
    let candidatCreated
    let aurigeFile
    let placeBeforTimeOutRetryCreated
    let placeAfterTimeOutRetryCreated
    let places
    beforeAll(async () => {
      await createInspecteurs()
      await createCentres()

      placeBeforTimeOutRetryCreated = await createTestPlaceAurige(
        placeBeforTimeOutRetry
      )
      placeAfterTimeOutRetryCreated = await createTestPlaceAurige(
        placeAfterTimeOutRetry
      )
      places = [placeBeforTimeOutRetryCreated, placeAfterTimeOutRetryCreated]

      aurigeFile = toAurigeJsonBuffer(candidatFailureExam)
    })

    beforeEach(async () => {
      candidatCreated = await createCandidatToTestAurige(
        candidatFailureExam,
        true
      )
    })

    afterEach(async () => {
      await candidatModel.findByIdAndDelete(candidatCreated._id)
    })

    afterAll(async () => {
      await Promise.all(places.map(deletePlace))
      await removeCentres()
    })

    async function synchroAurigeSuccess (aurigeFile, candidatCreated) {
      const result = await synchroAurige(aurigeFile)
      expect(result).toBeDefined()
      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('nom', candidatFailureExam.nomNaissance)
      expect(result[0]).toHaveProperty('neph', candidatFailureExam.codeNeph)
      expect(result[0]).toHaveProperty('status', 'success')
      expect(result[0]).toHaveProperty('details', OK_UPDATED)
      const candidat = await findCandidatById(candidatCreated._id, {
        canBookFrom: 1,
        places: 1,
        noReussites: 1,
        nbEchecsPratiques: 1,
      })
      const { canBookFrom } = candidat
      const dateTimeCanBookFrom = getFrenchLuxonDateTimeFromISO(
        candidatFailureExam.dateDernierNonReussite
      )
        .endOf('day')
        .plus({ days: config.timeoutToRetry })

      expect(canBookFrom).toBeDefined()
      expect(canBookFrom).toEqual(dateTimeCanBookFrom.toJSDate())

      return candidat
    }

    function expectNoReussites (nbEchecsPratiques, noReussites) {
      expect(nbEchecsPratiques).toBe(
        Number(candidatFailureExam.nbEchecsPratiques)
      )
      expect(noReussites).toHaveLength(1)
      expect(noReussites[0]).toHaveProperty(
        'reason',
        candidatFailureExam.objetDernierNonReussite
      )
      expect(noReussites[0].date).toEqual(
        getFrenchLuxonDateTimeFromISO(
          candidatFailureExam.dateDernierNonReussite
        ).toJSDate()
      )
    }

    it('should have penalty when candidat failed in exam', async () => {
      const { noReussites, nbEchecsPratiques } = await synchroAurigeSuccess(
        aurigeFile,
        candidatCreated
      )
      expectNoReussites(nbEchecsPratiques, noReussites)
    })

    it('should have penalty and remove resa which is before time out to retry', async () => {
      await makeResa(placeBeforTimeOutRetryCreated, candidatCreated)
      const {
        places,
        noReussites,
        nbEchecsPratiques,
      } = await synchroAurigeSuccess(aurigeFile, candidatCreated)

      expectNoReussites(nbEchecsPratiques, noReussites)

      expect(places).toBeDefined()
      expect(places).toHaveLength(1)
      expect(places[0]).toHaveProperty(
        'centre',
        placeBeforTimeOutRetryCreated.centre
      )
      expect(places[0].inspecteur.toString()).toBe(
        placeBeforTimeOutRetryCreated.inspecteur._id.toString()
      )
      expect(places[0]).toHaveProperty(
        'date',
        placeBeforTimeOutRetryCreated.date
      )
      expect(places[0].archivedAt).toBeDefined()
      expect(places[0]).toHaveProperty('archiveReason', REASON_EXAM_FAILED)
      const place = await findPlaceById(placeBeforTimeOutRetryCreated._id)
      expect(place).toBeDefined()
      expect(place.candidat).toBeUndefined()
    })
    it('should have penalty and not remove resa which is after time out to retry', async () => {
      await makeResa(placeAfterTimeOutRetryCreated, candidatCreated)
      const {
        places,
        nbEchecsPratiques,
        noReussites,
      } = await synchroAurigeSuccess(aurigeFile, candidatCreated)
      expect(places).toBeUndefined()
      const place = await findPlaceById(placeAfterTimeOutRetryCreated._id)
      expect(place).toBeDefined()
      expect(place.candidat).toBeDefined()
      expect(place).toHaveProperty('candidat', candidatCreated._id)

      expectNoReussites(nbEchecsPratiques, noReussites)
    })
  })

  describe('candidat passed the exam', () => {
    let candidatCreated
    let placesCreated
    let aurigeFile

    beforeAll(async () => {
      await createCentres()
      placesCreated = await createPlaces()
      aurigeFile = toAurigeJsonBuffer(candidatPassed)
    })

    beforeEach(async () => {
      candidatCreated = await createCandidatToTestAurige(candidatPassed, true)
    })
    afterEach(async () => {
      await candidatModel.findByIdAndDelete(candidatCreated._id)
    })
    afterAll(async () => {
      await removePlaces()
      await removeCentres()
    })

    const synchroAurigeToPassExam = async (
      aurigeFile,
      infoCandidat,
      idCandidat
    ) => {
      const { nomNaissance, codeNeph, email } = infoCandidat
      const result = await synchroAurige(aurigeFile)
      expect(result).toBeDefined()
      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('nom', nomNaissance)
      expect(result[0]).toHaveProperty('neph', codeNeph)
      expect(result[0]).toHaveProperty('status', 'warning')
      expect(result[0]).toHaveProperty('details', EPREUVE_PRATIQUE_OK)

      const candidat = await findCandidatById(idCandidat, {})
      expect(candidat).toBeNull()

      const candidatArchived = await findArchivedCandidatByNomNeph(
        nomNaissance,
        codeNeph
      )

      expect(candidatArchived).toBeDefined()
      expect(candidatArchived).toHaveProperty('email', email)
      expect(candidatArchived.archivedAt).toBeDefined()
      expect(candidatArchived).toHaveProperty(
        'archiveReason',
        EPREUVE_PRATIQUE_OK
      )
      expect(candidatArchived.reussitePratique).toEqual(
        getFrenchLuxonDateTimeFromISO(infoCandidat.reussitePratique).toJSDate()
      )
    }
    it('should archive candidat', async () => {
      await synchroAurigeToPassExam(
        aurigeFile,
        candidatPassed,
        candidatCreated._id
      )
    })

    it('should archive candidat and release place', async () => {
      const placeSelected = placesCreated[0]
      await makeResa(placeSelected, candidatCreated)
      await synchroAurigeToPassExam(
        aurigeFile,
        candidatPassed,
        candidatCreated._id
      )
      const place = await findPlaceById(placeSelected._id)
      expect(place.candidat).toBeUndefined()
    })
  })
})
