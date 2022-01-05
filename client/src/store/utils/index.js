import { getFrenchLuxonCurrentDateTime, getFrenchLuxonFromIso } from '@/util'
import { valideCreneaux as validCrenx } from '../../util/creneauSetting'

export const getDayString = isoDate => {
  return `${getFrenchLuxonFromIso(isoDate).weekdayLong} ${getFrenchLuxonFromIso(isoDate).toFormat(
    'dd LLLL yyyy',
  )}`
}

export const getHoursString = isoDate => {
  return `${getFrenchLuxonFromIso(isoDate).toFormat("HH'h'mm")}-${getFrenchLuxonFromIso(isoDate)
    .plus({ minutes: 30 })
    .toFormat("HH'h'mm")}`
}

export const formatResult = (
  timeslots,
  monthsToDisplay = 4,
  canBookFrom = getFrenchLuxonCurrentDateTime().toISO(),
  anticipatedCanBookAfter = getFrenchLuxonCurrentDateTime().toISO(),
  dayToForbidCancel = 0,
  validCreneaux = validCrenx,
) => {
  const slots = ('length' in timeslots ? timeslots : []).reduce((timeslotsByMonth, timeslot) => {
    const timeslotLuxon = getFrenchLuxonFromIso(timeslot)

    // Gestion du délai de réservation (Un candidat ne peut pas réserver avant x jours)
    // if (dayToForbidCancel) {
    //   const goToNext =
    //     timeslotLuxon.startOf('day') <
    //     getFrenchLuxonCurrentDateTime()
    //       .plus({ days: dayToForbidCancel })
    //       .startOf('day')
    //   if (goToNext) {
    //     return timeslotsByMonth
    //   }
    // }

    // Gestion de la pénalité en cas de modification de la réservation actuelle du candidat
    if (anticipatedCanBookAfter) {
      const goToNext = getFrenchLuxonFromIso(anticipatedCanBookAfter).endOf('day') > timeslotLuxon
      if (goToNext) {
        return timeslotsByMonth
      }
    }

    // Gestion de la pénalité du candidat (pour annulation ou échec, par exemple)
    if (canBookFrom) {
      const goToNext = getFrenchLuxonFromIso(canBookFrom) > timeslotLuxon
      if (goToNext) {
        return timeslotsByMonth
      }
    }

    const month = timeslot.substring(0, 7)
    if (!timeslotsByMonth.has(month)) {
      const monthContent = {
        label: timeslotLuxon.monthLong,
        month,
        days: new Map(),
      }
      timeslotsByMonth.set(month, monthContent)
    }

    const day = timeslot.substring(0, 10)

    // Gestion des créneaux à présenter (Pas entre midi et 13h30 par exemple)
    const slotLabel = getHoursString(timeslot)
    if (!validCreneaux.includes(slotLabel)) {
      return timeslotsByMonth
    }

    const monthContent = timeslotsByMonth.get(month)
    if (!monthContent.days.has(day)) {
      const dayContent = {
        label: getDayString(timeslot),
        slots: [],
      }
      monthContent.days.set(day, dayContent)
    }
    const existingDay = timeslotsByMonth.get(month).days.get(day)
    existingDay.slots = [...existingDay.slots, getHoursString(timeslot)]
    return timeslotsByMonth
  }, new Map())

  const slotsMap = Array(monthsToDisplay)
    .fill(undefined)
    .reduce((timeslots, item, index) => {
      const luxonMonth = getFrenchLuxonCurrentDateTime().plus({ month: index })
      const month = `${luxonMonth.year}-${String(luxonMonth.month).padStart(2, '0')}`
      const result = new Map(timeslots)
      if (!timeslots.has(month)) {
        result.set(month, {
          label: luxonMonth.monthLong,
          month,
        })
      }
      return result
    }, slots)

  return [...slotsMap]
    .map(([, month]) => month)
    .sort(({ month }, { month: otherMonth }) => {
      return month > otherMonth ? 1 : -1
    })
}

export const formatLogsData = (data) => {
  const rawLogs = Object.entries(data.logs)

  const shapedDays = rawLogs.reduce((accu, contentAndRange) => {
    const [range] = contentAndRange
    const beginAndEndHour = range.split('_')
    const dateOfLog = beginAndEndHour[2]

    if (!accu[`${dateOfLog}`]) {
      accu[`${dateOfLog}`] = []
    }

    return accu
  }, {})

  const finalResult = Object.entries(shapedDays).map(([date]) => {
    const summaryByDepartement = {}
    const summaryNational = {}

    const details = rawLogs.filter(([dateRange]) => dateRange.split('_')[2] === date).map(([range, content]) => {
      const beginAndEndHour = range.split('_')
      const begin = beginAndEndHour[0]
      const end = beginAndEndHour[1]

      const formatedLogs = {
        begin: `${begin}h`,
        end: `${end}h`,
        departements: Object.entries(content)
          .map(([departement, statusesInfo]) => {
            if (!summaryByDepartement[departement]) {
              summaryByDepartement[departement] = {}
            }
            return {
              departement,
              statusesInfo: Object.entries(statusesInfo).map(([status, logsContent]) => {
                if (!summaryByDepartement[departement][status]) {
                  summaryByDepartement[departement][status] = { R: 0, M: 0, A: 0 }
                }
                summaryByDepartement[departement][status].R += (logsContent?.R || 0)
                summaryByDepartement[departement][status].M += (logsContent?.M || 0)
                summaryByDepartement[departement][status].A += (logsContent?.A || 0)

                if (!summaryNational[status]) {
                  summaryNational[status] = { R: 0, M: 0, A: 0 }
                }
                summaryNational[status].R += (logsContent?.R || 0)
                summaryNational[status].M += (logsContent?.M || 0)
                summaryNational[status].A += (logsContent?.A || 0)

                return { status, logsContent }
              }),
            }
          }),
      }
      return formatedLogs
    })

    const summaryByDept = Object.entries(summaryByDepartement).map(([dpt, content]) => ({
      dpt,
      content: Object.entries(content).map(([status, infos]) => ({ status, infos })),
    }))

    const sumaryNationalTmp = Object.entries(summaryNational).map(([status, infos]) => ({ status, infos }))
    return { date, content: { details, summaryByDepartement: summaryByDept, summaryNational: sumaryNationalTmp } }
  })

  return finalResult
}
