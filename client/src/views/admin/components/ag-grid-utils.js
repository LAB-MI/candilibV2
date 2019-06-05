import { getFrenchLuxonDateFromIso, getDateTimeFrFromJSDate } from '@/util/frenchDateTime'
import { DateTime } from 'luxon'

export const AgGridLocaleText = {
  of: 'de',
  contains: 'Contient',
  equals: '=',
  notEqual: '<>',
  lessThan: '<',
  greaterThan: '>',
  lessThanOrEqual: '<=',
  greaterThanOrEqual: '>=',
  inRange: 'entre',
  notContains: 'Ne contient pas',
  startsWith: 'Commence par',
  endsWith: 'Finit par',
  AND: 'Et',
  OR: 'Ou',
}

export const valueDateFormatter = param => {
  console.log(param)
  return param.value ? getFrenchLuxonDateFromIso(param.value).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS) : ''
}
export const filterDateParams = {
  comparator: function (filterLocalDateAtMidnight, cellValue) {
    const cellDate = getFrenchLuxonDateFromIso(cellValue)
    const selectedDate = getDateTimeFrFromJSDate(filterLocalDateAtMidnight)
    const diffDate = cellDate.diff(selectedDate, [ 'days', 'hours' ])
    return Object.is(diffDate.values.days, -0) ? -1 : diffDate.days
  },
  browserDatePicker: true,
}

export const StatusRenderer = (param) => {
  const StatusIcon = {
    'success': 'done',
    'error': 'clear',
  }
  return '<i class="material-icons">' + StatusIcon[param.value] + '</i>'
}
