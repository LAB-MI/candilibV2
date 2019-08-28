import fs from 'fs'
import path from 'path'
import util from 'util'
import config from '../../../config'
import { findArchivedCandidatByNomNeph } from '../../../models/archived-candidat/archived-candidat.queries'
import { createCandidat, findCandidatById } from '../../../models/candidat'
import candidatModel from '../../../models/candidat/candidat.model'
import { deletePlace, findPlaceById } from '../../../models/place'
import { createCentres, removeCentres } from '../../../models/__tests__/centres'
import {
  createInspecteurs,
  removeInspecteur,
} from '../../../models/__tests__/inspecteurs'
import { createPlaces } from '../../../models/__tests__/places'
import { makeResa } from '../../../models/__tests__/reservations'
import { connect, disconnect } from '../../../mongo-connection'
import {
  EPREUVE_PRATIQUE_OK,
  OK_UPDATED,
  getFrenchLuxon,
  getFrenchLuxonFromISO,
  getFrenchLuxonFromObject,
  NB_FAILURES_KO,
  getFrenchLuxonFromJSDate,
  NO_CANDILIB,
} from '../../../util'
import { REASON_EXAM_FAILED } from '../../common/reason.constants'
import {
  isEpreuveEtgInvalid,
  isETGExpired,
  isMoreThan2HoursAgo,
  synchroAurige,
  updateCandidatLastNoReussite,
} from './synchro-aurige'
import { toAurigeJsonBuffer } from './__tests__/aurige'
import candidats from './__tests__/candidats'
import {
  candidatFailureExam,
  candidatPassed,
  createCandidatToTestAurige,
  candidatFailureExamWith5Failures as candidat5FailureExam,
} from './__tests__/candidats-aurige'
import {
  createTestPlaceAurige,
  placeAfterTimeOutRetry,
  placeBeforTimeOutRetry,
  placeSameDateDernierEchecPratique,
  placeNoSameDateDernierEchecPratique,
  placeSameDateDernierEchecPratiqueForSuccess,
} from './__tests__/places-aurige'
import archivedCandidatModel from '../../../models/archived-candidat/archived-candidat.model'

jest.mock('../../../util/logger')
jest.mock('../../business/send-mail')

const bookedAt = getFrenchLuxon().toJSDate()
const readFileAsPromise = util.promisify(fs.readFile)

describe('synchro-aurige', () => {
  beforeAll(async () => {
    await connect()
    await createInspecteurs()
    await createCentres()
  })
  afterAll(async () => {
    await removeCentres()
    await removeInspecteur()
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
    const moreThan2HoursAgo = getFrenchLuxon()
      .minus(
        2 * 60 * 60 * 1000 + 10000 //  A little more than 2h
      )
      .toJSDate()

    const isExpired = isMoreThan2HoursAgo(moreThan2HoursAgo)

    expect(isExpired).toBe(true)
  })

  it('Should return true for date way back in the passed', () => {
    const lessThan2HoursAgo = getFrenchLuxon(2018).toJSDate()

    const isExpired = isMoreThan2HoursAgo(lessThan2HoursAgo)

    expect(isExpired).toBe(true)
  })

  it('Should return false for date less than 2 hours ago', () => {
    const lessThan2HoursAgo = getFrenchLuxon()
      .minus(
        2 * 60 * 60 * 1000 - 10000 //  A little less than 2h
      )
      .toJSDate()

    const isExpired = isMoreThan2HoursAgo(lessThan2HoursAgo)

    expect(isExpired).toBe(false)
  })

  it('Should remove double in array candidats with last date is not in noReussites', () => {
    const dateTime = getFrenchLuxonFromObject({
      day: 18,
      hour: 9,
    })
    const lastDateTime = dateTime.plus({ days: 2 }).toISO()
    const noReussite = {
      date: dateTime.toJSDate(),
      reason: 'Echec',
    }
    const candidat = {
      noReussites: [
        {
          date: dateTime.minus({ days: 1 }).toJSDate(),
          reason: 'Echec',
        },
        noReussite,
        noReussite,
        noReussite,
        {
          date: dateTime.plus({ days: 1 }).toJSDate(),
          reason: 'Echec',
        },
      ],
    }

    updateCandidatLastNoReussite(candidat, lastDateTime, 'Absent')

    expect(candidat.noReussites).toBeDefined()
    expect(candidat.noReussites).toHaveLength(3)
  })

  it('Should remove double in array candidats with last date in noReussites', () => {
    const dateTime = getFrenchLuxonFromObject({
      day: 18,
      hour: 9,
    })
    const lastDateTime = dateTime.plus({ days: 2 }).toISO()
    const noReussite = {
      date: dateTime.toJSDate(),
      reason: 'Echec',
    }
    const candidat = {
      noReussites: [
        {
          date: dateTime.minus({ days: 1 }).toJSDate(),
          reason: 'Echec',
        },
        noReussite,
        noReussite,
        noReussite,
        {
          date: dateTime.plus({ days: 1 }).toJSDate(),
          reason: 'Echec',
        },
        {
          date: dateTime.plus({ days: 2 }).toJSDate(),
          reason: 'Echec',
        },
      ],
    }

    updateCandidatLastNoReussite(candidat, lastDateTime, 'Absent')

    expect(candidat.noReussites).toBeDefined()
    expect(candidat.noReussites).toHaveLength(4)
    expect(
      candidat.noReussites[candidat.noReussites.length - 1]
    ).toHaveProperty('reason', 'Absent')
  })

  describe('check candidats have valided their email', () => {
    let candidatsToCreate
    let aurigeFile

    beforeAll(async () => {
      candidatsToCreate = candidats.map(candidat => createCandidat(candidat))
      const candidatsCreated = await Promise.all(candidatsToCreate)

      candidatsCreated[0].isValidatedEmail = true
      await candidatsCreated[0].save()

      candidatsCreated[1].presignedUpAt = getFrenchLuxon()
        .minus(
          2 * 60 * 60 * 1000 + 10000 // A little more than 2h
        )
        .toJSDate()
      await candidatsCreated[1].save()

      candidatsCreated[2].presignedUpAt = getFrenchLuxon()
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

  function expectDataCandidat (candidat, candidatInfo) {
    expect(candidat).toHaveProperty('nomNaissance', candidatInfo.nomNaissance)
    expect(candidat).toHaveProperty('codeNeph', candidatInfo.codeNeph)
    const dateETGCandidat = getFrenchLuxonFromJSDate(candidat.dateReussiteETG)
    const dateETGExpected = getFrenchLuxonFromISO(candidatInfo.dateReussiteETG)
    expect(dateETGCandidat.hasSame(dateETGExpected, 'day')).toBe(true)
    expect(candidat).toHaveProperty('email', candidatInfo.email)
    expect(candidat).toHaveProperty('portable', candidatInfo.portable)
    expect(candidat).toHaveProperty('adresse', candidatInfo.adresse)
    expect(candidat).toHaveProperty('isValidatedByAurige', true)
  }

  describe('Synchro-aurige With a candidat failed', () => {
    let candidatCreated
    let aurigeFile
    let placeBeforTimeOutRetryCreated
    let placeAfterTimeOutRetryCreated
    let places
    beforeAll(async () => {
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
      require('../../../util/logger').setWithConsole(false)
    })

    afterEach(async () => {
      await candidatModel.findByIdAndDelete(candidatCreated._id)
    })

    afterAll(async () => {
      await Promise.all(places.map(deletePlace))
    })

    async function synchroAurigeSuccess (aurigeFile, candidatCreated) {
      const result = await synchroAurige(aurigeFile)
      expect(result).toBeDefined()
      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('nom', candidatFailureExam.nomNaissance)
      expect(result[0]).toHaveProperty('neph', candidatFailureExam.codeNeph)
      expect(result[0]).toHaveProperty('status', 'success')
      expect(result[0]).toHaveProperty('details', OK_UPDATED)
      const candidat = await findCandidatById(candidatCreated._id)
      const { canBookFrom } = candidat
      const dateTimeCanBookFrom = getFrenchLuxonFromISO(
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
        getFrenchLuxonFromISO(
          candidatFailureExam.dateDernierNonReussite
        ).toJSDate()
      )
    }

    it('should have penalty when candidat failed in exam', async () => {
      const candidat = await synchroAurigeSuccess(aurigeFile, candidatCreated)
      const { noReussites, nbEchecsPratiques } = candidat
      expectDataCandidat(candidat, candidatFailureExam)
      expectNoReussites(nbEchecsPratiques, noReussites)
    })

    it('should have penalty when candidat failed in exam and date ETG changed', async () => {
      const dateReussiteETG = getFrenchLuxonFromISO(
        candidatFailureExam.dateReussiteETG
      )
        .plus({ days: 5 })
        .toISODate()
      const candidatFailureExamDateETGChanged = {
        ...candidatFailureExam,
        dateReussiteETG,
      }
      const aurigeFileDateETGChanged = toAurigeJsonBuffer(
        candidatFailureExamDateETGChanged
      )

      const candidat = await synchroAurigeSuccess(
        aurigeFileDateETGChanged,
        candidatCreated
      )
      const { noReussites, nbEchecsPratiques } = candidat
      expectDataCandidat(candidat, candidatFailureExamDateETGChanged)
      expectNoReussites(nbEchecsPratiques, noReussites)
    })

    it('should have penalty and remove resa which is before time out to retry', async () => {
      await makeResa(placeBeforTimeOutRetryCreated, candidatCreated, bookedAt)
      const candidat = await synchroAurigeSuccess(aurigeFile, candidatCreated)
      const { places, noReussites, nbEchecsPratiques } = candidat
      expectDataCandidat(candidat, candidatFailureExam)
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
      expect(places[0]).toHaveProperty(
        'archiveReason',
        REASON_EXAM_FAILED + NO_CANDILIB
      )
      expect(places[0]).toHaveProperty('isCandilib', false)

      const place = await findPlaceById(placeBeforTimeOutRetryCreated._id)
      expect(place).toBeDefined()
      expect(place.candidat).toBeUndefined()
    })

    it('should have penalty and not remove resa which is after time out to retry', async () => {
      await makeResa(placeAfterTimeOutRetryCreated, candidatCreated, bookedAt)
      const candidat = await synchroAurigeSuccess(aurigeFile, candidatCreated)
      const { places, noReussites, nbEchecsPratiques } = candidat

      expectDataCandidat(candidat, candidatFailureExam)

      expect(places).toBeUndefined()
      const place = await findPlaceById(placeAfterTimeOutRetryCreated._id)
      expect(place).toBeDefined()
      expect(place.candidat).toBeDefined()
      expect(place.candidat).toHaveProperty('_id', candidatCreated._id)

      expectNoReussites(nbEchecsPratiques, noReussites)
    })
  })

  describe('Synchro-aurige candidat passed the exam', () => {
    let candidatCreated
    let placesCreated
    let aurigeFile

    beforeAll(async () => {
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
      await placesCreated.delete()
    })

    const synchroAurigeToPassExam = async (
      aurigeFile,
      infoCandidat,
      candidatId
    ) => {
      const { nomNaissance, codeNeph, email } = infoCandidat
      const result = await synchroAurige(aurigeFile)
      expect(result).toBeDefined()
      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('nom', nomNaissance)
      expect(result[0]).toHaveProperty('neph', codeNeph)
      expect(result[0]).toHaveProperty('status', 'warning')
      expect(result[0]).toHaveProperty('details', EPREUVE_PRATIQUE_OK)

      const candidat = await findCandidatById(candidatId, {})
      expect(candidat).toBeNull()

      const candidatArchived = await findArchivedCandidatByNomNeph(
        nomNaissance,
        codeNeph
      )

      expect(candidatArchived).toBeDefined()
      expect(candidatArchived).toHaveProperty('email', email)
      expect(candidatArchived.archivedAt).toBeDefined()
      const archivedAt = getFrenchLuxonFromJSDate(candidatArchived.archivedAt)
      const now = getFrenchLuxon()
      expect(archivedAt.hasSame(now, 'day')).toBe(true)

      expect(candidatArchived).toHaveProperty(
        'archiveReason',
        EPREUVE_PRATIQUE_OK
      )
      expect(candidatArchived.reussitePratique).toEqual(
        getFrenchLuxonFromISO(infoCandidat.reussitePratique).toJSDate()
      )

      expect(candidatArchived).toHaveProperty('isValidatedByAurige', true)

      if (infoCandidat.dateReussiteETG) {
        expect(
          getFrenchLuxonFromJSDate(candidatArchived.dateReussiteETG)
        ).toEqual(getFrenchLuxonFromISO(infoCandidat.dateReussiteETG))
      } else {
        expect(candidatArchived).toHaveProperty('dateReussiteETG')
      }

      return candidatArchived
    }

    it('should archive candidat', async () => {
      const candidatArchived = await synchroAurigeToPassExam(
        aurigeFile,
        candidatPassed,
        candidatCreated._id
      )
      expectDataCandidat(candidatArchived, candidatPassed)
      expect(candidatArchived.places).toBeUndefined()
      await candidatArchived.delete()
    })

    it('should archive candidat and release place with success is in candilib', async () => {
      const placeSelected = await createTestPlaceAurige(
        placeSameDateDernierEchecPratiqueForSuccess
      )
      await makeResa(placeSelected, candidatCreated, bookedAt)
      const candidatArchived = await synchroAurigeToPassExam(
        aurigeFile,
        candidatPassed,
        candidatCreated._id
      )
      expectDataCandidat(candidatArchived, candidatPassed)
      expect(candidatArchived.places).toHaveLength(1)
      expect(candidatArchived.places[0]).toHaveProperty(
        'date',
        placeSelected.date
      )
      expect(candidatArchived.places[0]).toHaveProperty(
        'inspecteur',
        placeSelected.inspecteur
      )
      expect(candidatArchived.places[0]).toHaveProperty(
        'centre',
        placeSelected.centre
      )
      const archivedAt = getFrenchLuxonFromJSDate(
        candidatArchived.places[0].archivedAt
      )
      const now = getFrenchLuxon()
      expect(archivedAt.hasSame(now, 'day')).toBe(true)
      expect(candidatArchived.places[0]).toHaveProperty(
        'archiveReason',
        EPREUVE_PRATIQUE_OK
      )
      expect(candidatArchived.places[0]).toHaveProperty('isCandilib', true)

      const place = await findPlaceById(placeSelected._id)
      expect(place.candidat).toBeUndefined()
      await placeSelected.delete()
      await candidatArchived.delete()
    })

    it('should archive candidat and release place with success is out candilib', async () => {
      const placeSelected = placesCreated[0]
      await makeResa(placeSelected, candidatCreated, bookedAt)
      const candidatArchived = await synchroAurigeToPassExam(
        aurigeFile,
        candidatPassed,
        candidatCreated._id
      )
      expectDataCandidat(candidatArchived, candidatPassed)

      expect(candidatArchived.places).toHaveLength(1)
      expect(candidatArchived.places[0]).toHaveProperty(
        'date',
        placeSelected.date
      )
      expect(candidatArchived.places[0]).toHaveProperty(
        'inspecteur',
        placeSelected.inspecteur
      )
      expect(candidatArchived.places[0]).toHaveProperty(
        'centre',
        placeSelected.centre
      )
      const archivedAt = getFrenchLuxonFromJSDate(
        candidatArchived.places[0].archivedAt
      )
      const now = getFrenchLuxon()
      expect(archivedAt.hasSame(now, 'day')).toBe(true)
      expect(candidatArchived.places[0]).toHaveProperty(
        'archiveReason',
        EPREUVE_PRATIQUE_OK + NO_CANDILIB
      )
      expect(candidatArchived.places[0]).toHaveProperty('isCandilib', false)

      const place = await findPlaceById(placeSelected._id)
      expect(place.candidat).toBeUndefined()
      await candidatArchived.delete()
    })
  })

  describe('Synchro-aurige candidat failed 5 times', () => {
    let candidatCreated
    let aurigeFile

    beforeAll(async () => {
      aurigeFile = toAurigeJsonBuffer(candidat5FailureExam)
    })

    beforeEach(async () => {
      candidatCreated = await createCandidatToTestAurige(
        candidat5FailureExam,
        true
      )
    })
    afterEach(async () => {
      const { nomNaissance, codeNeph } = candidatCreated
      await candidatModel.findByIdAndDelete(candidatCreated._id)
      await archivedCandidatModel.findOneAndDelete({ nomNaissance, codeNeph })
    })

    const synchroAurigeTo5FailureExam = async (
      aurigeFile,
      infoCandidat,
      candidatId
    ) => {
      const { nomNaissance, codeNeph, email } = infoCandidat
      const result = await synchroAurige(aurigeFile)

      expect(result).toBeDefined()
      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('nom', nomNaissance)
      expect(result[0]).toHaveProperty('neph', codeNeph)
      expect(result[0]).toHaveProperty('status', 'warning')
      expect(result[0]).toHaveProperty('details', NB_FAILURES_KO)

      const candidat = await findCandidatById(candidatId, {})
      expect(candidat).toBeNull()

      const candidatArchived = await findArchivedCandidatByNomNeph(
        nomNaissance,
        codeNeph
      )

      expect(candidatArchived).toBeDefined()
      expect(candidatArchived).toHaveProperty('email', email)
      expect(candidatArchived.archivedAt).toBeDefined()
      expect(candidatArchived).toHaveProperty('archiveReason', NB_FAILURES_KO)
      expect(candidatArchived).toHaveProperty('nbEchecsPratiques', 5)
      const lengthNoReussite = candidatArchived.noReussites.length

      expect(candidatArchived.noReussites[lengthNoReussite - 1].date).toEqual(
        getFrenchLuxonFromISO(infoCandidat.dateDernierNonReussite).toJSDate()
      )

      return candidatArchived
    }

    it('should archive candidat', async () => {
      const candidatArchived = await synchroAurigeTo5FailureExam(
        aurigeFile,
        candidat5FailureExam,
        candidatCreated._id
      )

      expectDataCandidat(candidatArchived, candidat5FailureExam)
    })

    it('should release place and archive candidat and place', async () => {
      const placeSelected = await createTestPlaceAurige(
        placeSameDateDernierEchecPratique
      )

      await makeResa(placeSelected, candidatCreated, bookedAt)
      const candidatArchived = await synchroAurigeTo5FailureExam(
        aurigeFile,
        candidat5FailureExam,
        candidatCreated._id
      )
      expectDataCandidat(candidatArchived, candidat5FailureExam)

      expect(candidatArchived.places).toHaveLength(1)
      expect(candidatArchived.places[0]).toHaveProperty(
        'date',
        placeSelected.date
      )
      expect(candidatArchived.places[0]).toHaveProperty(
        'inspecteur',
        placeSelected.inspecteur
      )
      expect(candidatArchived.places[0]).toHaveProperty(
        'centre',
        placeSelected.centre
      )
      const archivedAt = getFrenchLuxonFromJSDate(
        candidatArchived.places[0].archivedAt
      )
      const now = getFrenchLuxon()
      expect(archivedAt.hasSame(now, 'day')).toBe(true)
      expect(candidatArchived.places[0]).toHaveProperty(
        'archiveReason',
        NB_FAILURES_KO
      )

      const place = await findPlaceById(placeSelected._id)
      expect(place.candidat).toBeUndefined()

      await deletePlace(placeSelected)
    })

    it('should release place and archive candidat and place with failure is out candilib', async () => {
      const placeSelected = await createTestPlaceAurige(
        placeNoSameDateDernierEchecPratique
      )
      await makeResa(placeSelected, candidatCreated, bookedAt)
      const candidatArchived = await synchroAurigeTo5FailureExam(
        aurigeFile,
        candidat5FailureExam,
        candidatCreated._id
      )
      expect(candidatArchived.places).toHaveLength(1)
      expect(candidatArchived.places[0]).toHaveProperty(
        'date',
        placeSelected.date
      )
      expect(candidatArchived.places[0]).toHaveProperty(
        'inspecteur',
        placeSelected.inspecteur
      )
      expect(candidatArchived.places[0]).toHaveProperty(
        'centre',
        placeSelected.centre
      )
      const archivedAt = getFrenchLuxonFromJSDate(
        candidatArchived.places[0].archivedAt
      )
      const now = getFrenchLuxon()
      expect(archivedAt.hasSame(now, 'day')).toBe(true)
      expect(candidatArchived.places[0]).toHaveProperty(
        'archiveReason',
        NB_FAILURES_KO + NO_CANDILIB
      )
      expect(candidatArchived.places[0]).toHaveProperty('isCandilib', false)

      const place = await findPlaceById(placeSelected._id)
      expect(place.candidat).toBeUndefined()

      await deletePlace(placeSelected)
    })
  })
})
