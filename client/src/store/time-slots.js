
import { DateTime } from 'luxon'
import api from '@/api'
import { SHOW_ERROR } from './message'

export const FETCH_DATES_REQUEST = 'FETCH_DATES_REQUEST'
export const FETCH_DATES_SUCCESS = 'FETCH_DATES_SUCCESS'
export const FETCH_DATES_FAILURE = 'FETCH_DATES_FAILURE'
export const SELECT_DAY = 'SELECT_DAY'

const formatResult = (result) => {
  const arrayOfMonth = [...new Set(result.map(el => DateTime.fromISO(el).monthLong))]
  const formatDayAndHours = result.map(el => ({
    month: DateTime.fromISO(el).monthLong,
    availableTimeSlots: {
      day: `${DateTime.fromISO(el).weekdayLong} ${DateTime.fromISO(el).setLocale('fr').toFormat('dd LLL yyyy')}`,
      hours: `${DateTime.fromISO(el).toFormat("HH'h'mm")}-${DateTime.fromISO(el).plus({ minutes: 30 }).toFormat("HH'h'mm")}`,
    },
  }))
  const formatedResult = arrayOfMonth.map(monthElem => {
    const arrayOfDayByMonth = [...new Set(formatDayAndHours.map(el => el.month === monthElem ? el.availableTimeSlots.day : '').filter(el => el !== ''))]
    const arrayHoursByDay = arrayOfDayByMonth.map(item => ({
      day: item,
      hours: formatDayAndHours.map(el => el.availableTimeSlots.day === item ? el.availableTimeSlots.hours : '').filter(el => el !== ''),
    }))
    return {
      month: monthElem,
      availableTimeSlots: arrayHoursByDay,
    }
  })
  return formatedResult
}

export default {
  state: {
    isFetching: false,
    list: [],
    selected: undefined,
  },
  mutations: {
    [FETCH_DATES_REQUEST] (state) {
      state.isFetching = true
    },
    [FETCH_DATES_SUCCESS] (state, dates) {
      state.isFetching = false
      state.list = dates
    },
    [FETCH_DATES_FAILURE] (state) {
      state.isFetching = false
    },
    [SELECT_DAY] (state, selected) {
      state.selected = selected
    },
  },
  actions: {
    async [FETCH_DATES_REQUEST] ({ commit, dispatch }, selectedCenterId) {
      commit(FETCH_DATES_REQUEST)
      try {
        const begin = DateTime.local().toISO()
        const end = DateTime.local().plus({ month: 3 }).endOf('month').toISO()
        const result = await api.candidat.getPlaces(selectedCenterId, begin, end)

        const formatedResult = formatResult(result)
        commit(FETCH_DATES_SUCCESS, formatedResult)
      } catch (error) {
        commit(FETCH_DATES_FAILURE, error.message)
        dispatch(SHOW_ERROR, error.message)
      }
    },
    [SELECT_DAY] ({ commit }, selected) {
      commit(SELECT_DAY, selected)
    },
  },
}
