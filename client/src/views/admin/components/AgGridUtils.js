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
}

export const valueDateFormatter = param => {
  return param.value ? DateTime.fromISO(param.value).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS) : ''
}
export const filterDateParams = {
  comparator: function (filterLocalDateAtMidnight, cellValue) {
    const cellDate = DateTime.fromISO(cellValue)
    const selectedDate = DateTime.fromJSDate(filterLocalDateAtMidnight)
    const diffDate = cellDate.diff(selectedDate, [ 'days', 'hours' ])
    return diffDate.days
  },
  browserDatePicker: true,
}
