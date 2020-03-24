import fs from 'fs'
import path from 'path'
import util from 'util'
import { simpleParser } from 'mailparser'
import config, { smtpOptions } from '../../../config'
import { findArchivedCandidatByNomNeph } from '../../../models/archived-candidat/archived-candidat.queries'
import { createCandidat, findCandidatById } from '../../../models/candidat'
import candidatModel from '../../../models/candidat/candidat.model'
import {
  createDepartement,
  deleteDepartementById,
} from '../../../models/departement'
import { deletePlace, findPlaceById } from '../../../models/place'
import {
  createCentres,
  removeCentres,
  setInitCreatedCentre,
} from '../../../models/__tests__/centres'
import {
  createInspecteurs,
  removeInspecteur,
  setInitCreatedInspecteurs,
} from '../../../models/__tests__/inspecteurs'
import { createPlaces } from '../../../models/__tests__/places'
import { makeResa } from '../../../models/__tests__/reservations'
import { connect, disconnect } from '../../../mongo-connection'
import {
  EPREUVE_ETG_KO,
  EPREUVE_PRATIQUE_OK,
  getFrenchLuxon,
  getFrenchLuxonFromISO,
  getFrenchLuxonFromJSDate,
  getFrenchLuxonFromObject,
  NB_FAILURES_KO,
  NO_CANDILIB,
  OK,
  OK_UPDATED,
  EPREUVE_PRATIQUE_OK_BEFORE_SING_UP,
} from '../../../util'
import { REASON_EXAM_FAILED } from '../../common/reason.constants'
import {
  isETGExpired,
  isMoreThan2HoursAgo,
  synchroAurige,
  updateCandidatLastNoReussite,
} from './synchro-aurige'
import { toAurigeJsonBuffer } from './__tests__/aurige'
import candidats from './__tests__/candidats'
import {
  candidatFailureExam,
  candidatFailureExamWith5Failures as candidat5FailureExam,
  candidatPassed,
  candidatsWithPreRequired,
  candidatWithEtgExpiredToArchive,
  candidatWithEtgExpired,
  createCandidatToTestAurige,
  dateReussiteETG,
  dateReussiteETGKO,
  candidatWithEtgExpiredAndFailedToArchive,
  DateTimeReussiteETGKO,
} from './__tests__/candidats-aurige'
import {
  createTestPlaceAurige,
  placeAfterTimeOutRetry,
  placeAtETG,
  placeBeforTimeOutRetry,
  placeNoSameDateDernierEchecPratique,
  placeSameDateDernierEchecPratique,
  placeSameDateDernierEchecPratiqueForSuccess,
} from './__tests__/places-aurige'
import archivedCandidatModel from '../../../models/archived-candidat/archived-candidat.model'

import { buildSmtpServer } from '../../business/__tests__/smtp-server'
import archivedPlaceModel from '../../../models/archived-place/archived-place-model'
import placeModel from '../../../models/place/place.model'
import { SUBJECT_MAIL_INFO } from '../../business'

jest.mock('../../../util/logger')
require('../../../util/logger').setWithConsole(false)

jest.mock('../../../config', () => ({
  smtpMaxConnections: 1,
  smtpRateDelta: 1000,
  smtpRateLimit: undefined,
  smtpMaxAttemptsToSend: 5,
  smtpOptions: {
    host: 'localhost',
    port: 10025,
    secure: false,
    tls: {
      // do not failed with selfsign certificates
      rejectUnauthorized: false,
    },
    auth: {
      user: 'test',
      pass: 'test',
    },
  },
  dbOptions: {},
  delayToBook: 7,
  timeoutToRetry: 7,
  userStatuses: {
    CANDIDAT: 'candidat',
  },
  userStatusLevels: {
    candidat: 0,
  },
  secret: 'TEST',
}))

const bookedAt = getFrenchLuxon().toJSDate()
const readFileAsPromise = util.promisify(fs.readFile)

const placeExpect = (place, expectPlace) => {
  expect(place).toHaveProperty('date', expectPlace.date)
  expect(place).toHaveProperty('inspecteur', expectPlace.inspecteur)
  expect(place).toHaveProperty('centre', expectPlace.centre)
  expect(place).toHaveProperty('bookedAt', bookedAt)
}

function expectDataCandidat (candidat, candidatInfo) {
  const {
    nomNaissance,
    codeNeph,
    dateReussiteETG,
    email,
    portable,
    adresse,
  } = candidatInfo
  expect(candidat).toHaveProperty('nomNaissance', nomNaissance)
  expect(candidat).toHaveProperty('codeNeph', codeNeph)
  const dateETGCandidat = getFrenchLuxonFromJSDate(candidat.dateReussiteETG)
  const dateETGExpected = getFrenchLuxonFromISO(dateReussiteETG)
  expect(dateETGCandidat.hasSame(dateETGExpected, 'day')).toBe(true)
  expect(candidat).toHaveProperty('email', email)
  expect(candidat).toHaveProperty('portable', portable)
  expect(candidat).toHaveProperty('adresse', adresse)
  expect(candidat).toHaveProperty('isValidatedByAurige', true)
}

const candidatArchivedExpect = async (infoCandidat, archiveReason) => {
  const {
    nomNaissance,
    codeNeph,
    dateDernierNonReussite,
    dateReussiteETG,
  } = infoCandidat
  const candidatArchived = await findArchivedCandidatByNomNeph(
    nomNaissance,
    codeNeph
  )

  expect(candidatArchived).toBeDefined()
  expectDataCandidat(candidatArchived, infoCandidat)
  expect(candidatArchived.archivedAt).toBeDefined()
  expect(candidatArchived).toHaveProperty('archiveReason', archiveReason)

  if (dateDernierNonReussite) {
    const lengthNoReussite = candidatArchived.noReussites.length

    const dateETGCandidat = getFrenchLuxonFromJSDate(
      candidatArchived.dateReussiteETG
    )
    const dateETGExpected = getFrenchLuxonFromISO(dateReussiteETG)
    expect(dateETGCandidat.hasSame(dateETGExpected, 'day')).toBe(true)

    expect(candidatArchived.noReussites[lengthNoReussite - 1].date).toEqual(
      getFrenchLuxonFromISO(dateDernierNonReussite).toJSDate()
    )
  }

  return candidatArchived
}

async function synchroAurigeSuccess (
  aurigeFile,
  candidatCreated,
  candidatInfo = candidatFailureExam
) {
  const result = await synchroAurige(aurigeFile)
  expect(result).toBeDefined()
  expect(result).toHaveLength(1)
  expect(result[0]).toHaveProperty('nom', candidatInfo.nomNaissance)
  expect(result[0]).toHaveProperty('neph', candidatInfo.codeNeph)
  expect(result[0]).toHaveProperty('details', OK_UPDATED)
  expect(result[0]).toHaveProperty('status', 'success')
  const candidat = await findCandidatById(candidatCreated._id)
  if (candidatInfo.dateDernierNonReussite) {
    const { canBookFrom } = candidat
    const dateTimeCanBookFrom = getFrenchLuxonFromISO(
      candidatInfo.dateDernierNonReussite
    )
      .endOf('day')
      .plus({ days: config.timeoutToRetry })

    expect(canBookFrom).toBeDefined()
    expect(canBookFrom).toEqual(dateTimeCanBookFrom.toJSDate())
  }

  return candidat
}

const synchroAurigeToPassExam = async (
  aurigeFile,
  infoCandidat,
  candidatId,
  reason = EPREUVE_PRATIQUE_OK
) => {
  const { nomNaissance, codeNeph, email } = infoCandidat
  const result = await synchroAurige(aurigeFile)
  expect(result).toBeDefined()
  expect(result).toHaveLength(1)
  expect(result[0]).toHaveProperty('nom', nomNaissance)
  expect(result[0]).toHaveProperty('neph', codeNeph)
  expect(result[0]).toHaveProperty('status', 'warning')
  expect(result[0]).toHaveProperty('details', reason)

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

  expect(candidatArchived).toHaveProperty('archiveReason', reason)
  expect(candidatArchived.reussitePratique).toEqual(
    getFrenchLuxonFromISO(infoCandidat.reussitePratique).toJSDate()
  )

  expect(candidatArchived).toHaveProperty('isValidatedByAurige', true)

  if (infoCandidat.dateReussiteETG) {
    expect(getFrenchLuxonFromJSDate(candidatArchived.dateReussiteETG)).toEqual(
      getFrenchLuxonFromISO(infoCandidat.dateReussiteETG)
    )
  } else {
    expect(candidatArchived).toHaveProperty('dateReussiteETG')
  }

  return candidatArchived
}

describe('synchro-aurige', () => {
  let server
  beforeAll(async () => {
    await connect()
    await createInspecteurs()
    await createCentres()
  })
  beforeEach(done => {
    server = buildSmtpServer(smtpOptions.port, done)
  })
  afterEach(done => {
    server.close(done)
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

    expect(isExpired).toBe(false)
  })

  it('Should return not expired with 4 years ago', () => {
    const almostFiveYearsAgo = new Date()
    almostFiveYearsAgo.setFullYear(new Date().getFullYear() - 4)

    const isExpired = isETGExpired(almostFiveYearsAgo)

    expect(isExpired).toBe(false)
  })

  it('Should return not expired with 5 years ago', () => {
    const almostFiveYearsAgo = getFrenchLuxonFromISO(dateReussiteETG)

    const isExpired = isETGExpired(almostFiveYearsAgo)

    expect(isExpired).toBe(false)
  })

  it('Should return not expired with 5 years and 1 day ago ', () => {
    const almostFiveYearsAgo = getFrenchLuxonFromISO(dateReussiteETGKO)

    const isExpired = isETGExpired(almostFiveYearsAgo)

    expect(isExpired).toBe(true)
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

    it('Should return details', async () => {
      const result = await synchroAurige(aurigeFile)
      expect(result[0]).toHaveProperty('details', OK)
      expect(result[1]).toHaveProperty('details', 'EMAIL_NOT_VERIFIED_EXPIRED')
      expect(result[2]).toHaveProperty('details', 'EMAIL_NOT_VERIFIED_YET')
    })
  })

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
    const departementData = { _id: '93', email: 'email93@onepiece.com' }
    beforeAll(async () => {
      await createDepartement(departementData)
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
      await deleteDepartementById(departementData._id)
      await placesCreated.delete()
    })

    it('should archive candidat who passed exam and have not already valided by aurige', async () => {
      await candidatModel.update(
        { codeNeph: candidatPassed.codeNeph },
        { $set: { isValidatedByAurige: false } }
      )
      const candidatArchived = await synchroAurigeToPassExam(
        aurigeFile,
        candidatPassed,
        candidatCreated._id,
        EPREUVE_PRATIQUE_OK_BEFORE_SING_UP
      )
      expectDataCandidat(candidatArchived, candidatPassed)
      expect(candidatArchived.places).toBeUndefined()
      await candidatArchived.delete()
    })

    it('should archive candidat who passed exam and have already valided by aurige', async () => {
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
      placeExpect(candidatArchived.places[0], placeSelected)
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
      placeExpect(candidatArchived.places[0], placeSelected)
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
    const departementData = { _id: '93', email: 'email93@onepiece.com' }
    beforeAll(async () => {
      aurigeFile = toAurigeJsonBuffer(candidat5FailureExam)
    })

    beforeEach(async () => {
      await createDepartement(departementData)
      candidatCreated = await createCandidatToTestAurige(
        candidat5FailureExam,
        true
      )
    })
    afterEach(async () => {
      await deleteDepartementById(departementData._id)
      const { nomNaissance, codeNeph } = candidatCreated
      await candidatModel.findByIdAndDelete(candidatCreated._id)
      await archivedCandidatModel.findOneAndDelete({ nomNaissance, codeNeph })
    })

    const synchroAurigeTo5FailureExam = async (
      aurigeFile,
      infoCandidat,
      candidatId
    ) => {
      const { nomNaissance, codeNeph } = infoCandidat
      const result = await synchroAurige(aurigeFile)

      expect(result).toBeDefined()
      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('nom', nomNaissance)
      expect(result[0]).toHaveProperty('neph', codeNeph)
      expect(result[0]).toHaveProperty('details', NB_FAILURES_KO)
      expect(result[0]).toHaveProperty('status', 'warning')

      const candidat = await findCandidatById(candidatId, {})
      expect(candidat).toBeNull()

      const candidatArchived = await candidatArchivedExpect(
        infoCandidat,
        NB_FAILURES_KO
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
      placeExpect(candidatArchived.places[0], placeSelected)
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
      placeExpect(candidatArchived.places[0], placeSelected)
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

describe('Check canAccess property of aurige', () => {
  let candidatsToCreate
  let candidatsCreated
  let aurigeFile

  beforeAll(async () => {
    await connect()
    candidatsToCreate = candidatsWithPreRequired.map(candidat =>
      createCandidatToTestAurige(candidat, candidat.isValidatedByAurige)
    )
    candidatsCreated = await Promise.all(candidatsToCreate)

    aurigeFile = await readFileAsPromise(
      path.resolve(__dirname, './', '__tests__', 'aurigeWithAccessAt.json')
    )
  })
  let server
  beforeEach(done => {
    server = buildSmtpServer(smtpOptions.port, done)
  })
  afterEach(done => {
    server.close(done)
  })

  it('Should apply canAccesAt to candidat not validate by aurige', async () => {
    const result = await synchroAurige(aurigeFile)
    const candidat01 = await candidatModel.findById(candidatsCreated[0]._id)
    const candidat02 = await candidatModel.findById(candidatsCreated[1]._id)

    expect(candidat01).toHaveProperty(
      'canAccessAt',
      getFrenchLuxon()
        .startOf('day')
        .plus({ days: config.LINE_DELAY })
        .toJSDate()
    )
    expect(candidat02).toHaveProperty('canAccessAt', undefined)

    expect(result[0]).toHaveProperty('nom', candidat01.nomNaissance)
    expect(result[0]).toHaveProperty('neph', candidat01.codeNeph)
    expect(result[0]).toHaveProperty('status', 'success')
    expect(result[0]).toHaveProperty('details', 'OK_VALID')
    expect(result[0]).toHaveProperty(
      'message',
      `Pour le 93, un magic link est envoyé à ${candidat01.email}`
    )

    expect(result[1]).toHaveProperty('nom', candidat02.nomNaissance)
    expect(result[1]).toHaveProperty('neph', candidat02.codeNeph)
    expect(result[1]).toHaveProperty('status', 'success')
    expect(result[1]).toHaveProperty('details', 'OK_UPDATED')
    expect(result[1]).toHaveProperty(
      'message',
      `Pour le 93, ce candidat ${candidat02.email} a été mis à jour`
    )
  })

  afterAll(async () => {
    await Promise.all(
      candidatsToCreate.map(candidat =>
        candidatModel.findByIdAndDelete(candidat._id)
      )
    )
    await disconnect()
  })
})

describe('Synchro-aurige candidat with etg expired', () => {
  beforeAll(async () => {
    await connect()
    await setInitCreatedInspecteurs()
    await createInspecteurs()
    await setInitCreatedCentre()
    await createCentres()
  })
  let server
  beforeEach(done => {
    server = buildSmtpServer(smtpOptions.port, done)
  })
  afterEach(done => {
    server.close(done)
  })

  afterAll(async () => {
    await removeCentres()
    await removeInspecteur()
    await disconnect()
  })

  async function synchroAurigeETGKO (
    aurigeFile,
    candidatInJson,
    candidatCreated
  ) {
    const result = await synchroAurige(aurigeFile)
    expect(result).toBeDefined()
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('nom', candidatInJson.nomNaissance)
    expect(result[0]).toHaveProperty('neph', candidatInJson.codeNeph)
    expect(result[0]).toHaveProperty('status', 'warning')
    expect(result[0]).toHaveProperty('details', EPREUVE_ETG_KO)
    const candidat = await findCandidatById(candidatCreated._id)

    return candidat
  }

  it('should archive a candidat with date etg expired', async () => {
    const aurigeFile = toAurigeJsonBuffer(candidatWithEtgExpired)
    const candidatCreated = await createCandidatToTestAurige(
      candidatWithEtgExpired,
      true
    )
    const candidat = await synchroAurigeETGKO(
      aurigeFile,
      candidatWithEtgExpired,
      candidatCreated
    )

    expect(candidat).toBeNull()

    const archivedCandidat = await candidatArchivedExpect(
      candidatWithEtgExpired,
      EPREUVE_ETG_KO
    )

    await archivedCandidat.remove()
    await candidatCreated.remove()
  })

  it('should do not archive a candidat boooked at date etg expired', async () => {
    const placeSelected = await createTestPlaceAurige(placeAtETG)

    const aurigeFile = toAurigeJsonBuffer(candidatWithEtgExpired)
    const candidatCreated = await createCandidatToTestAurige(
      candidatWithEtgExpired,
      true
    )

    await makeResa(placeSelected, candidatCreated, bookedAt)

    const candidat = await synchroAurigeSuccess(
      aurigeFile,
      candidatCreated,
      candidatWithEtgExpired
    )
    expect(candidat).toBeDefined()
    expect(candidat).not.toBeNull()

    const candidatArchived = await findArchivedCandidatByNomNeph(
      candidatWithEtgExpired.nomNaissance,
      candidatWithEtgExpired.codeNeph
    )
    expect(candidatArchived).toBeNull()
    await candidat.remove()
    await placeSelected.remove()
  })

  it('should do not archive a candidat boooked at date etg expired, 7 ago', async () => {
    const dateTimeReussiteETGKO7 = DateTimeReussiteETGKO.minus({ days: 6 })
    const placeAtETG7 = {
      ...placeAtETG,
      date: DateTimeReussiteETGKO.plus({ years: 5, hours: 8 }).toISO({
        zone: 'utc',
      }),
    }
    const placeSelected = await createTestPlaceAurige(placeAtETG7)
    const candidatWithEtgExpired7 = {
      ...candidatWithEtgExpired,
      nomNaissance: candidatWithEtgExpired.nomNaissance + '7',
      dateReussiteETG: dateTimeReussiteETGKO7.toISODate(),
    }

    const aurigeFile = toAurigeJsonBuffer(candidatWithEtgExpired7)
    const candidatCreated = await createCandidatToTestAurige(
      candidatWithEtgExpired7,
      true
    )

    await makeResa(placeSelected, candidatCreated, bookedAt)

    const candidat = await synchroAurigeSuccess(
      aurigeFile,
      candidatCreated,
      candidatWithEtgExpired7
    )
    expect(candidat).toBeDefined()
    expect(candidat).not.toBeNull()
    const candidatArchived = await findArchivedCandidatByNomNeph(
      candidatWithEtgExpired7.nomNaissance,
      candidatWithEtgExpired7.codeNeph
    )

    expect(candidatArchived).toBeNull()
    await candidat.remove()
    await placeSelected.remove()
  })

  it('should archive a candidat boooked at date etg expired, 8 ago', async () => {
    const dateTimeReussiteETGKO8 = DateTimeReussiteETGKO.minus({ days: 7 })
    const placeAtETG8 = {
      ...placeAtETG,
      date: dateTimeReussiteETGKO8.plus({ years: 5, hours: 8 }).toISO({
        zone: 'utc',
      }),
    }
    const placeSelected = await createTestPlaceAurige(placeAtETG8)
    const candidatWithEtgExpired8 = {
      ...candidatWithEtgExpired,
      nomNaissance: candidatWithEtgExpired.nomNaissance + '8',
      dateReussiteETG: dateTimeReussiteETGKO8.toISODate(),
    }

    const aurigeFile = toAurigeJsonBuffer(candidatWithEtgExpired8)

    const candidatCreated = await createCandidatToTestAurige(
      candidatWithEtgExpired8,
      true
    )

    await makeResa(placeSelected, candidatCreated, bookedAt)

    const candidat = await synchroAurigeETGKO(
      aurigeFile,
      candidatWithEtgExpired8,
      candidatCreated
    )

    expect(candidat).toBeNull()

    const archivedCandidat = await candidatArchivedExpect(
      candidatWithEtgExpired8,
      EPREUVE_ETG_KO
    )

    await archivedCandidat.remove()
    await placeSelected.remove()
  })

  it('should do archive a candidat boooked at date etg expired and without resultat from Aurige', async () => {
    const placeSelected = await createTestPlaceAurige(placeAtETG)

    const aurigeFile = toAurigeJsonBuffer(candidatWithEtgExpiredToArchive)
    const candidatCreated = await createCandidatToTestAurige(
      candidatWithEtgExpiredToArchive,
      true
    )

    await makeResa(placeSelected, candidatCreated, bookedAt)

    const archivedCandidat = await synchroAurigeToPassExam(
      aurigeFile,
      candidatWithEtgExpiredToArchive,
      candidatCreated._id
    )

    await archivedCandidat.remove()
    await placeSelected.remove()
  })

  it('should do archive a candidat boooked at date etg expired and with resultat failed from Aurige', async () => {
    const placeSelected = await createTestPlaceAurige(placeAtETG)

    const aurigeFile = toAurigeJsonBuffer(
      candidatWithEtgExpiredAndFailedToArchive
    )
    const candidatCreated = await createCandidatToTestAurige(
      candidatWithEtgExpiredAndFailedToArchive,
      true
    )

    await makeResa(placeSelected, candidatCreated, bookedAt)

    const candidat = await synchroAurigeSuccess(
      aurigeFile,
      candidatCreated,
      candidatWithEtgExpiredAndFailedToArchive
    )

    expect(candidat).toBeDefined()
    expect(candidat).not.toBeNull()

    await candidat.remove()
    await placeSelected.remove()
  })
})

describe('Synchro-aurige: send mail', () => {
  let server
  let candidatCreated
  let placeSelected
  beforeAll(async () => {
    await connect()
    await setInitCreatedInspecteurs()
    await createInspecteurs()
    await setInitCreatedCentre()
    await createCentres()
    const departementData = { _id: '93', email: 'email93@onepiece.com' }
    await createDepartement(departementData)
  })
  beforeEach(done => {
    server = buildSmtpServer(smtpOptions.port, done)
  })
  afterEach(async done => {
    if (placeSelected) {
      const archivedPlace = await archivedPlaceModel.findOne({
        date: placeSelected.date,
        inspecteur: placeSelected.inspecteur,
      })
      if (archivedPlace) await archivedPlace.delete()
      const placeTmp = await placeModel.findOne({ _id: placeSelected._id })
      if (placeTmp) await placeTmp.delete()
    }
    await candidatModel.findByIdAndDelete(candidatCreated._id)
    server.close(done)
  })
  afterAll(async () => {
    await removeCentres()
    await removeInspecteur()
    await disconnect()
  })
  it('should get mail success before validate aurige', async done => {
    candidatCreated = await createCandidatToTestAurige(candidatPassed)
    const aurigeFile = toAurigeJsonBuffer(candidatPassed)
    server.onData = function (stream, session, callback) {
      const chunks = []
      stream.on('data', function (chunk) {
        chunks.push(chunk)
      })
      stream.on('end', async function () {
        const body = Buffer.concat(chunks)
        const mail = await simpleParser(body)
        expect(mail.headers.get('to')).toHaveProperty(
          'text',
          candidatPassed.email
        )
        expect(mail.headers.get('subject')).toBe(SUBJECT_MAIL_INFO)
        expect(mail.text).toMatch(
          /Selon nos informations vous avez déjà réussi votre examen du permis de conduire,[\n ]notre service ne vous est plus utile/
        )
        done()
        return callback()
      })
    }
    const result = await synchroAurige(aurigeFile)
    expect(result).toBeDefined()
  })
  it('should get mail success already validate aurige', async done => {
    candidatCreated = await createCandidatToTestAurige(candidatPassed, true)
    const aurigeFile = toAurigeJsonBuffer(candidatPassed)
    server.onData = function (stream, session, callback) {
      const chunks = []
      stream.on('data', function (chunk) {
        chunks.push(chunk)
      })
      stream.on('end', async function () {
        const body = Buffer.concat(chunks)
        const mail = await simpleParser(body)
        expect(mail.headers.get('to')).toHaveProperty(
          'text',
          candidatPassed.email
        )
        expect(mail.headers.get('subject')).toBe(SUBJECT_MAIL_INFO)
        expect(mail.text).toMatch(
          /Selon nos informations, vous avez réussi l'examen que vous venez de passer./
        )
        done()
        return callback()
      })
    }
    const result = await synchroAurige(aurigeFile)
    expect(result).toBeDefined()
  })
})
