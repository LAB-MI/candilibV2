import { simpleParser } from 'mailparser'
import { smtpOptions } from '../../../config'
import archivedPlaceModel from '../../../models/archived-place/archived-place-model'
import candidatModel from '../../../models/candidat/candidat.model'
import { ObjectLastNoReussitValues } from '../../../models/candidat/objetDernierNonReussite.values'
import {
  createDepartement,
} from '../../../models/departement'
import placeModel from '../../../models/place/place.model'
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
import { makeResa } from '../../../models/__tests__/reservations'
import { connect, disconnect } from '../../../mongo-connection'
import {
  getFrenchLuxon,
} from '../../../util'
import { SUBJECT_MAIL_INFO } from '../../business'
import { buildSmtpServer } from '../../business/__tests__/smtp-server'
import { upsertLastSyncAurige } from '../status-candilib-business'
import {
  synchroAurige,
} from './synchro-aurige'
import { toAurigeJsonBuffer } from './__tests__/aurige'
import {
  candidatFailureExam, candidatPassed, createCandidatToTestAurige,
} from './__tests__/candidats-aurige'
import {
  createTestPlaceAurige, placeSameDateDernierEchecPratique,
} from './__tests__/places-aurige'

jest.mock('../../admin/status-candilib-business')
jest.mock('../../../util/logger')
require('../../../util/logger').setWithConsole(false)

jest.mock('../../../config', () => {
  const timeOutToAbs = require('../../../models/candidat/objetDernierNonReussite.values').ObjectLastNoReussitValues.ABSENT
  return {
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
    delayToBook: 3,
    timeoutToRetry: 7,
    timeoutToRetryBy: {
      [timeOutToAbs]: 10,
      default: 7,
    },
    userStatuses: {
      CANDIDAT: 'candidat',
    },
    userStatusLevels: {
      candidat: 0,
    },
    secret: 'TEST',
    LINE_DELAY: 1,
  }
})

upsertLastSyncAurige.mockResolvedValue(true)
const bookedAt = getFrenchLuxon().toJSDate()

const buildSmtpServerAsync = async () => {
  let server
  await (new Promise(resolve => {
    server = buildSmtpServer(smtpOptions.port, done => resolve(done))
  }))
  return server
}

const smtpServerCloseAsync = async (server) => new Promise(resolve => {
  server.close(done => resolve(done))
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
    server = await buildSmtpServerAsync()
  })
  afterEach(async () => {
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
  })
  afterAll(async () => {
    await removeCentres()
    await removeInspecteur()
    await disconnect()
    await smtpServerCloseAsync(server)
  })
  it('should get mail success before validate aurige', done => {
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
          candidatPassed.email,
        )
        expect(mail.headers.get('subject')).toBe(SUBJECT_MAIL_INFO)
        expect(mail.text).toMatch(
          /Selon nos informations vous avez déjà réussi votre examen du permis de conduire,[\n ]notre service ne vous est plus utile/,
        )
        done()
        return callback()
      })
    }

    expectGetMailSuccessBeforeValid()
  })

  async function expectGetMailSuccessBeforeValid () {
    candidatCreated = await createCandidatToTestAurige(candidatPassed)
    const aurigeFile = toAurigeJsonBuffer(candidatPassed)
    const result = await synchroAurige(aurigeFile)
    expect(result).toBeDefined()
  }

  it('should no send mail failed exam when candidat failed exam', done => {
    let isDone = false
    server.onData = function (stream, session, callback) {
      const chunks = []
      stream.on('data', function (chunk) {
        console.log('data')
        chunks.push(chunk)
      })

      stream.on('end', function () {
        expect(chunks).toHaveLength(0)
        isDone = true
        done()
        return callback()
      })
    }

    expectedNoMailForExamFailed()

    setTimeout(() => {
      expect(isDone).toBe(false)
      done()
    }, 1000)
  })

  async function expectedNoMailForExamFailed () {
    const aurigeFile = toAurigeJsonBuffer(candidatFailureExam)
    candidatCreated = await createCandidatToTestAurige(
      candidatFailureExam,
      true,
    )
    const result = await synchroAurige(aurigeFile)
    expect(result).toBeDefined()
  }

  it('should send mail failed exam when candidat have booking and failed exam', done => {
    server.onData = function (stream, session, callback) {
      const chunks = []
      stream.on('data', function (chunk) {
        chunks.push(chunk)
      })
      stream.on('end', function () {
        var body = Buffer.concat(chunks)
        expect(body.toString()).toMatch(
          new RegExp(`To:.${candidatCreated.email}`),
        )
        expect(body.toString()).toMatch(
          new RegExp(`Subject:.${SUBJECT_MAIL_INFO}`),
        )
        expect(body.toString()).toMatch(new RegExp("En cas d'=C3=A9chec,"))
        done()
        return callback()
      })
    }
    expectedSendMailForExamFaliedBooked()
  })

  async function expectedSendMailForExamFaliedBooked () {
    candidatCreated = await createCandidatToTestAurige(
      candidatFailureExam,
      true,
    )
    placeSelected = await createTestPlaceAurige(
      placeSameDateDernierEchecPratique,
    )

    await makeResa(placeSelected, candidatCreated, bookedAt)
    const aurigeFile = toAurigeJsonBuffer(candidatFailureExam)
    const result = await synchroAurige(aurigeFile)
    expect(result).toBeDefined()
  }

  it('should get mail success already validate aurige', done => {
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
          candidatPassed.email,
        )
        expect(mail.headers.get('subject')).toBe(SUBJECT_MAIL_INFO)
        expect(mail.text).toMatch(
          /Selon nos informations, vous avez réussi l'examen que vous venez de passer./,
        )
        done()
        return callback()
      })
    }
    expectedGetMailForAurigeValid()
  })

  async function expectedGetMailForAurigeValid () {
    candidatCreated = await createCandidatToTestAurige(candidatPassed, true)
    const aurigeFile = toAurigeJsonBuffer(candidatPassed)
    const result = await synchroAurige(aurigeFile)
    expect(result).toBeDefined()
  }

  it('should send mail absent exam when candidat have booking and absent at exam', done => {
    server.onData = function (stream, session, callback) {
      const chunks = []
      stream.on('data', function (chunk) {
        chunks.push(chunk)
      })
      stream.on('end', function () {
        var body = Buffer.concat(chunks)
        expect(body.toString()).toMatch(
          new RegExp(`To:.${candidatCreated.email}`),
        )
        expect(body.toString()).toMatch(
          new RegExp(`Subject:.${SUBJECT_MAIL_INFO}`),
        )
        expect(body.toString()).toMatch(
          new RegExp(" l'examen, et nous avons perdu une place qui aurait pu"),
        )
        done()
        return callback()
      })
    }
    expectedForAbsentMail()
  })

  async function expectedForAbsentMail () {
    const candidat = {
      ...candidatFailureExam,
      objetDernierNonReussite: ObjectLastNoReussitValues.ABSENT,
    }

    candidatCreated = await createCandidatToTestAurige(candidat, true)
    placeSelected = await createTestPlaceAurige(
      placeSameDateDernierEchecPratique,
    )

    await makeResa(placeSelected, candidatCreated, bookedAt)

    const aurigeFile = toAurigeJsonBuffer(candidat)

    const result = await synchroAurige(aurigeFile)
    expect(result).toBeDefined()
  }

  it('should send mail no examine at exam when candidat have booking and is no examinable at exam', done => {
    server.onData = function (stream, session, callback) {
      const chunks = []
      stream.on('data', function (chunk) {
        chunks.push(chunk)
      })
      stream.on('end', function () {
        var body = Buffer.concat(chunks)
        expect(body.toString()).toMatch(
          new RegExp(`To:.${candidatCreated.email}`),
        )
        expect(body.toString()).toMatch(
          new RegExp(`Subject:.${SUBJECT_MAIL_INFO}`),
        )
        expect(body.toString()).toMatch(
          new RegExp('car vous ne remplissiez pas toutes les conditions'),
        )
        done()
        return callback()
      })
    }
    expectedSendMailNoExam()
  })

  async function expectedSendMailNoExam () {
    const candidat = {
      ...candidatFailureExam,
      objetDernierNonReussite: ObjectLastNoReussitValues.NO_EXAMINABLE,
    }
    candidatCreated = await createCandidatToTestAurige(candidat, true)
    placeSelected = await createTestPlaceAurige(
      placeSameDateDernierEchecPratique,
    )

    await makeResa(placeSelected, candidatCreated, bookedAt)

    const aurigeFile = toAurigeJsonBuffer(candidat)

    const result = await synchroAurige(aurigeFile)
    expect(result).toBeDefined()
  }
})
