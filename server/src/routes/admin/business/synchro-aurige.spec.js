import fs from 'fs'
import path from 'path'
import util from 'util'

import candidats from './__tests__/candidats'
import { createCandidat } from '../../../models/candidat'
import { DateTime } from 'luxon'

import { connect, disconnect } from '../../../mongo-connection'

import {
  isEpreuveEtgInvalid,
  isETGExpired,
  synchroAurige,
  isMoreThan2HoursAgo,
} from './synchro-aurige'

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
    const moreThan2HoursAgo = DateTime.local()
      .minus(
        2 * 60 * 60 * 1000 + 10000 //  A little more than 2h
      )
      .toJSDate()

    const isExpired = isMoreThan2HoursAgo(moreThan2HoursAgo)

    expect(isExpired).toBe(true)
  })

  it('Should return true for date way back in the passed', () => {
    const lessThan2HoursAgo = DateTime.local(2018).toJSDate()

    const isExpired = isMoreThan2HoursAgo(lessThan2HoursAgo)

    expect(isExpired).toBe(true)
  })

  it('Should return false for date less than 2 hours ago', () => {
    const lessThan2HoursAgo = DateTime.local()
      .minus(
        2 * 60 * 60 * 1000 - 10000 //  A little less than 2h
      )
      .toJSDate()

    const isExpired = isMoreThan2HoursAgo(lessThan2HoursAgo)

    expect(isExpired).toBe(false)
  })

  it('Should return ', async () => {
    const candidatsToCreate = candidats.map(candidat =>
      createCandidat(candidat)
    )
    const candidatsCreated = await Promise.all(candidatsToCreate)

    candidatsCreated[0].isValidatedEmail = true
    await candidatsCreated[0].save()

    candidatsCreated[1].presignedUpAt = DateTime.local()
      .minus(
        2 * 60 * 60 * 1000 + 10000 // A little more than 2h
      )
      .toJSDate()
    await candidatsCreated[1].save()

    candidatsCreated[2].presignedUpAt = DateTime.local()
      .minus(
        2 * 60 * 60 * 1000 - 10000 // A little less than 2h
      )
      .toJSDate()
    await candidatsCreated[2].save()

    const aurigeFile = await readFileAsPromise(
      path.resolve(__dirname, './', '__tests__', 'aurige.json')
    )

    const result = await synchroAurige(aurigeFile)

    expect(result[0]).toHaveProperty('details', 'OK')
    expect(result[1]).toHaveProperty('details', 'EMAIL_NOT_VERIFIED_EXPIRED')
    expect(result[2]).toHaveProperty('details', 'EMAIL_NOT_VERIFIED_YET')
  })
})
