import { formatResult } from './utils'

describe('time-slots', () => {
  it('transform time-slots', () => {
    const input = [
      '2019-07-28T08:00:00.000+02:00',
      '2019-07-28T08:30:00.000+02:00',
      '2019-07-28T09:00:00.000+02:00',
      '2019-08-28T08:00:00.000+02:00',
      '2019-08-28T08:30:00.000+02:00',
      '2019-08-28T09:00:00.000+02:00',
      '2019-09-28T08:00:00.000+02:00',
      '2019-09-28T08:30:00.000+02:00',
      '2019-09-28T09:00:00.000+02:00',
    ]
    const expectedOutput = [
      {
        month: '2019-06',
        label: 'juin',
      },
      {
        month: '2019-07',
        label: 'juillet',
        days: new Map([
          [
            '2019-07-28',
            {
              label: 'dimanche 28 juillet 2019',
              slots: ['08h00-08h30', '08h30-09h00', '09h00-09h30'],
            },
          ],
        ]),
      },
      {
        month: '2019-08',
        label: 'août',
        days: new Map([
          [
            '2019-08-28',
            {
              label: 'mercredi 28 août 2019',
              slots: ['08h00-08h30', '08h30-09h00', '09h00-09h30'],
            },
          ],
        ]),
      },
      {
        month: '2019-09',
        label: 'septembre',
        days: new Map([
          [
            '2019-09-28',
            {
              label: 'samedi 28 septembre 2019',
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
