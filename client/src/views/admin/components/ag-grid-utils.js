import { getFrenchLuxonFromIso, getFrenchLuxonFromJSDate, getFrenchDateFromXslx } from '@/util/frenchDateTime'
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
  if (!param.value) {
    return ''
  }
  let luxonDateTime = getFrenchLuxonFromIso(param.value)
  if (luxonDateTime.invalid) {
    luxonDateTime = DateTime.fromFormat(param.value, 'dd/MM/yy HH:mm')
  }
  return luxonDateTime.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
}

export const filterDateParams = {
  comparator: function (filterLocalDateAtMidnight, cellValue) {
    let cellDate = getFrenchLuxonFromIso(cellValue)
    if (cellDate.invalid) {
      cellDate = getFrenchDateFromXslx(cellValue)
    }
    const selectedDate = getFrenchLuxonFromJSDate(filterLocalDateAtMidnight)
    const diffDate = cellDate.diff(selectedDate, [ 'days', 'hours' ])
    return Object.is(diffDate.values.days, -0) ? -1 : diffDate.days
  },
  browserDatePicker: true,
}

export const statusRenderer = ({ value }) => {
  const statusIcon = {
    'success': 'done',
    'error': 'clear',
    'warning': 'warning',
  }
  return '<i class="material-icons">' + statusIcon[value] + '</i>'
}

export const checkRenderer = ({ value }) => {
  if (!value) {
    return ''
  }
  const color = value ? 'green' : 'grey'
  const iconName = 'done'
  return `<i class="material-icons" style="color: ${color}">${iconName}</i>`
}
