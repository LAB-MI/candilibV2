
import { DateTime } from 'luxon'
import api from '@/api'
import { SHOW_ERROR, SHOW_SUCCESS } from './message'

export const FETCH_DATES_REQUEST = 'FETCH_DATES_REQUEST'
export const FETCH_DATES_SUCCESS = 'FETCH_DATES_SUCCESS'
export const FETCH_DATES_FAILURE = 'FETCH_DATES_FAILURE'

export const SELECT_DAY = 'SELECT_DAY'

export const CONFIRM_SELECT_DAY_REQUEST = 'CONFIRM_SELECT_DAY_REQUEST'
export const CONFIRM_SELECT_DAY_SUCCESS = 'CONFIRM_SELECT_DAY_SUCCESS'
export const CONFIRM_SELECT_DAY_FAILURE = 'CONFIRM_SELECT_DAY_FAILURE'

const formatResult = (result) => {
  const arrayOfMonth = [...new Set(result.map(el => DateTime.fromISO(el).monthLong))]
  const formatDayAndHours = result.map(el => ({
    month: DateTime.fromISO(el).monthLong,
    availableTimeSlots: {
      day: `${DateTime.fromISO(el).weekdayLong} ${DateTime.fromISO(el).setLocale('fr').toFormat('dd LLLL yyyy')}`,
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
    confirmed: false,
    isFetching: false,
    isSelecting: false,
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
      state.confirmed = false
    },

    [CONFIRM_SELECT_DAY_REQUEST] (state) {
      state.isSelecting = true
    },
    [CONFIRM_SELECT_DAY_SUCCESS] (state, selected) {
      state.isSelecting = false
      state.selected = selected
      state.confirmed = true
    },
    [CONFIRM_SELECT_DAY_FAILURE] (state) {
      state.isSelecting = false
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

    async [SELECT_DAY] ({ commit, dispatch }, selected) {
      const { slot, centre } = selected
      const result = await api.candidat.checkPlacesAvailability(centre.id, slot)
      if (result.length > 0) {
        commit(SELECT_DAY, selected)
      } else {
        commit(SELECT_DAY, undefined)
        throw new Error("La place n'est plus disponible")
      }
    },

    async [CONFIRM_SELECT_DAY_REQUEST] ({ commit, dispatch }, selected) {
      commit(CONFIRM_SELECT_DAY_REQUEST)
      const { slot, centre, isAccompanied, hasDualControlCar } = selected
      const result = await api.candidat.setReservations(centre.id, slot, isAccompanied, hasDualControlCar)
      if (result && result.success) {
        // localStorage.setItem('isConfirmed', true)
        commit(CONFIRM_SELECT_DAY_SUCCESS, selected)
        dispatch(SHOW_SUCCESS, 'Votre reservation a bien ete prise en compte')
      } else {
        commit(CONFIRM_SELECT_DAY_FAILURE)
        throw new Error("La place n'est plus disponible")
      }
    },
  },
}
