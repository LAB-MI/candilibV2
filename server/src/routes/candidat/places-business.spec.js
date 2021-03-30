import { connect, disconnect } from '../../mongo-connection'

import config from '../../config'
import { findCandidatById } from '../../models/candidat'

import { findCentreByNameAndDepartement } from '../../models/centre'
import { createPlace } from '../../models/place'
import PlaceModel from '../../models/place/place.model'
import {
  centres,
  createCentres,
  createPlaces,
  removeCentres,
  removePlaces,
  commonBasePlaceDateTime,
} from '../../models/__tests__/'
import {
  getDatesByCentre,
  canCancelReservation,
  getDatesByCentreId,
} from './places-business'
import {
  getFrenchLuxon,
  getFrenchFormattedDateTime,
  getFrenchLuxonFromObject,
  NB_YEARS_ETG_EXPIRED,
} from '../../util'

import { CANDIDAT_DATE_ETG_KO } from './message.constants'

jest.mock('../../models/candidat')
jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)
jest.mock('./util/date-to-display')

describe('Test places business: utiles functions', () => {
  it('Should return true when entry date is 7 days and 2 hours days hours after now', () => {
    const dateResa = getFrenchLuxon()
      .plus({
        days: config.daysForbidCancel,
      })
      .set({ hour: 8, minute: 30 })
    const result = canCancelReservation(dateResa)
    expect(result).toBe(true)
  })

  it('Should return false when entry date is 6 days and 2 hours days hours after now', () => {
    const dateResa = getFrenchLuxon()
      .plus({
        days: config.daysForbidCancel - 1,
      })
      .set({ hour: 15, minute: 30 })
    const result = canCancelReservation(dateResa)
    expect(result).toBe(false)
  })
})

describe('Test places business: get dates from places available', () => {
  let placesCreated
  let centreSelected
  let nbPlacesAvailable
  let dateIn3Months
  let inspecteur
  beforeAll(async () => {
    await connect()
    const centresCreated = await createCentres()

    placesCreated = await createPlaces()
    centreSelected = centresCreated.find(
      ({ nom, departement }) =>
        nom === centres[2].nom && departement === centres[2].departement,
    )
    const placesCreatedFromSelected = placesCreated.filter(
      ({ centre }) => centre === centreSelected._id,
    )
    inspecteur = placesCreatedFromSelected[0].inspecteur

    dateIn3Months = getFrenchLuxon().plus({
      month: 3,
    }).minus({ days: 1 })
    if (dateIn3Months.weekday === 7) { dateIn3Months = dateIn3Months.minus({ day: 1 }) }

    const dateIn1Month = getFrenchLuxon().plus({ month: 1 })
    const sameDateInTestData = commonBasePlaceDateTime.hasSame(
      dateIn1Month,
      'days',
    )
    const count = (await Promise.all([
      createPlace({
        centre: centreSelected._id,
        inspecteur,
        date: sameDateInTestData
          ? dateIn1Month.plus({ days: 1 })
          : dateIn1Month,
        visibleAt: getFrenchLuxonFromObject({ hour: 9 }).minus({ days: 1 }),
      }),
      createPlace({
        centre: centreSelected._id,
        inspecteur,
        date: (sameDateInTestData
          ? dateIn1Month.plus({ days: 1 })
          : dateIn1Month
        ).plus({ hours: 1 }),
        visibleAt: getFrenchLuxonFromObject({ hour: 9 }).minus({ days: 1 }),
      }),
      createPlace({
        centre: centreSelected._id,
        inspecteur,
        date: getFrenchLuxon().plus({ month: 2 }),
        visibleAt: getFrenchLuxonFromObject({ hour: 9 }).minus({ days: 1 }),
      }),
      createPlace({
        centre: centreSelected._id,
        inspecteur,
        date: dateIn3Months,
        visibleAt: getFrenchLuxonFromObject({ hour: 9 }).minus({ days: 1 }),
      }),
      createPlace({
        centre: centreSelected._id,
        inspecteur,
        date: getFrenchLuxon().plus({
          month: 4, // config.numberOfVisibleMonths + 1
        }),
        visibleAt: getFrenchLuxonFromObject({ hour: 9 }).minus({ days: 1 }),
      }),
    ])).length

    nbPlacesAvailable = placesCreatedFromSelected.length + count - 1
  })

  afterAll(async () => {
    await removePlaces()
    await removeCentres()
    await disconnect()
  })

  it('Should get 2 dates from places Centre 6', async () => {
    findCandidatById.mockResolvedValue({
      dateReussiteETG: getFrenchLuxon().toISODate(),
    })

    const dates = await getDatesByCentre(
      centreSelected.departement,
      centreSelected.nom,
    )

    expect(dates).toBeDefined()
    expect(dates).toHaveLength(nbPlacesAvailable)
  })

  it('Should get any places from Centre2 when ETG expired now', async () => {
    const dateETGExpired = getFrenchLuxon().minus({ years: 1 })
    findCandidatById.mockResolvedValue({
      dateReussiteETG: dateETGExpired
        .minus({ years: NB_YEARS_ETG_EXPIRED })
        .toJSDate(),
    })
    const centreSelected = await findCentreByNameAndDepartement(
      centres[2].nom,
      centres[2].departement,
    )
    const begin = getFrenchLuxon().toISODate()
    const end = getFrenchLuxon()
      .plus({ years: 1 })
      .toISODate()

    try {
      const dates = await getDatesByCentreId(
        centreSelected._id,
        begin,
        end,
        'candidatId',
      )
      expect(dates).toBeUndefined()
    } catch (error) {
      expect(error).toHaveProperty('status', 400)
      expect(error).toHaveProperty(
        'message',
        CANDIDAT_DATE_ETG_KO + getFrenchFormattedDateTime(dateETGExpired).date,
      )
    }
  })

  // TODO: Unskip next 'it' test after 31/12/2020
  xit('Should get many places from Centre2 when ETG expired in 2 months', async () => {
    const dateETGExpired = getFrenchLuxon().plus({ months: 1 })

    findCandidatById.mockResolvedValue({
      dateReussiteETG: dateETGExpired
        .minus({ years: NB_YEARS_ETG_EXPIRED })
        .toJSDate(),
    })
    const begin = getFrenchLuxon().toISODate()
    const end = getFrenchLuxon()
      .plus({ months: 6 })
      .toISODate()

    const dates = await getDatesByCentreId(
      centreSelected._id,
      begin,
      end,
      'candidatId',
    )
    expect(dates).toBeDefined()

    const count = await PlaceModel.countDocuments({
      centre: centreSelected._id,
      date: { $lt: dateETGExpired.toISODate() },
    })
    expect(dates).toHaveLength(count)
    expect(dates.includes(dateIn3Months.toISO()))
  })
})
