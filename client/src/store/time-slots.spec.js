import { formatResult } from './utils'
import { getFrenchLuxonFromObject, getFrenchDateFromLuxon } from '@/util'

const baseDate = getFrenchLuxonFromObject({ days: 28, hours: 8, minutes: 0, seconds: 0 }).plus({ months: 1 })

const input = [
  baseDate.toISO(),
  baseDate.plus({ minutes: 30 }).toISO(),
  baseDate.plus({ minutes: 60 }).toISO(),
  baseDate.plus({ months: 1 }).toISO(),
  baseDate.plus({ months: 1, minutes: 30 }).toISO(),
  baseDate.plus({ months: 1, minutes: 60 }).toISO(),
  baseDate.plus({ months: 2 }).toISO(),
  baseDate.plus({ months: 2, minutes: 30 }).toISO(),
  baseDate.plus({ months: 2, minutes: 60 }).toISO(),
]

xdescribe('time-slots', () => {
  it('transform time-slots', () => {
    const expectedOutput = [
      // Current month has no slot
      {
        label: baseDate.plus({ months: -1 }).setLocale('fr').monthLong,
        month: baseDate
          .plus({ months: -1 })
          .toISODate()
          .substr(0, 7),
      },
      // Next month has 3 slots the same day, on 28th
      {
        label: baseDate.setLocale('fr').monthLong,
        month: baseDate.toISODate().substr(0, 7),
        days: new Map([
          [
            baseDate.toISODate(),
            {
              label: getFrenchDateFromLuxon(baseDate),
              slots: ['08h00-08h30', '08h30-09h00', '09h00-09h30'],
            },
          ],
        ]),
      },
      // Month after next has 3 slots the same day, on 28th
      {
        label: baseDate.plus({ months: 1 }).setLocale('fr').monthLong,
        month: baseDate
          .plus({ months: 1 })
          .toISODate()
          .substr(0, 7),
        days: new Map([
          [
            baseDate.plus({ months: 1 }).toISODate(),
            {
              label: getFrenchDateFromLuxon(baseDate.plus({ months: 1 })),
              slots: ['08h00-08h30', '08h30-09h00', '09h00-09h30'],
            },
          ],
        ]),
      },
      // Month afteh that has 3 slots the same day, on 28th
      {
        label: baseDate.plus({ months: 2 }).setLocale('fr').monthLong,
        month: baseDate
          .plus({ months: 2 })
          .toISODate()
          .substr(0, 7),
        days: new Map([
          [
            baseDate.plus({ months: 2 }).toISODate(),
            {
              label: getFrenchDateFromLuxon(baseDate.plus({ months: 2 })),
              slots: ['08h00-08h30', '08h30-09h00', '09h00-09h30'],
            },
          ],
        ]),
      },
    ]

    const received = formatResult(input)

    expect(received).toEqual(expectedOutput)
  })
})
