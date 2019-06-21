import { getFrenchLuxonCurrentDateTime, getFrenchLuxonDateFromIso } from '@/util'
import { valideCreneaux as validCrenx } from '../../util/creneauSetting'

export const getDayString = elemISO => {
  return `${getFrenchLuxonDateFromIso(elemISO).weekdayLong} ${getFrenchLuxonDateFromIso(elemISO).toFormat(
    'dd LLLL yyyy'
  )}`
}

export const getHoursString = elemISO => {
  return `${getFrenchLuxonDateFromIso(elemISO).toFormat("HH'h'mm")}-${getFrenchLuxonDateFromIso(elemISO)
    .plus({ minutes: 30 })
    .toFormat("HH'h'mm")}`
}

export const formatResult = (
  timeslots,
  monthsToDisplay = 4,
  canBookFrom = getFrenchLuxonCurrentDateTime().toISO(),
  anticipatedCanBookAfter = getFrenchLuxonCurrentDateTime().toISO(),
  dayToForbidCancel = 0,
  validCreneaux = validCrenx
) => {
  const slots = timeslots.reduce((timeslotsByMonth, timeslot) => {
    const timeslotLuxon = getFrenchLuxonDateFromIso(timeslot)

    // Gestion du délai de réservation (Un candidat ne peut pas réserver avant x jours)
    if (dayToForbidCancel) {
      const goToNext =
        timeslotLuxon.startOf('day') <
        getFrenchLuxonCurrentDateTime()
          .plus({ days: dayToForbidCancel })
          .startOf('day')
      if (goToNext) {
        return timeslotsByMonth
      }
    }

    // Gestion de la pénalité en cas de modification de la réservation actuelle du candidat
    if (anticipatedCanBookAfter) {
      const goToNext = getFrenchLuxonDateFromIso(anticipatedCanBookAfter).endOf('day') > timeslotLuxon
      if (goToNext) {
        return timeslotsByMonth
      }
    }

    // Gestion de la pénalité du candidat (pour annulation ou échec, par exemple)
    if (canBookFrom) {
      const goToNext = getFrenchLuxonDateFromIso(canBookFrom) > timeslotLuxon
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
      let result = new Map(timeslots)
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
