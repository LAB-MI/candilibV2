
import { DateTime } from 'luxon'
import api from '@/api'
import { SHOW_ERROR, SHOW_SUCCESS } from './message'
import { dateTimeFromIsoSetLocaleFr } from '../util/dateTimeWithSetLocale.js'
import { SET_MODIFYING_RESERVATION } from '@/store'

export const FETCH_DATES_REQUEST = 'FETCH_DATES_REQUEST'
export const FETCH_DATES_SUCCESS = 'FETCH_DATES_SUCCESS'
export const FETCH_DATES_FAILURE = 'FETCH_DATES_FAILURE'

export const SELECT_DAY = 'SELECT_DAY'

export const CONFIRM_SELECT_DAY_REQUEST = 'CONFIRM_SELECT_DAY_REQUEST'
export const CONFIRM_SELECT_DAY_SUCCESS = 'CONFIRM_SELECT_DAY_SUCCESS'
export const CONFIRM_SELECT_DAY_FAILURE = 'CONFIRM_SELECT_DAY_FAILURE'

const getDayString = (elemISO) => {
  return `${dateTimeFromIsoSetLocaleFr(elemISO).weekdayLong} ${dateTimeFromIsoSetLocaleFr(elemISO).toFormat('dd LLLL yyyy')}`
}

const getHoursString = (elemISO) => {
  return `${dateTimeFromIsoSetLocaleFr(elemISO).toFormat("HH'h'mm")}-${dateTimeFromIsoSetLocaleFr(elemISO).plus({ minutes: 30 }).toFormat("HH'h'mm")}`
}

const formatResult = (result, countMonth) => {
  return Array(countMonth).fill(true).map((item, index) => {
    const monthNumber = DateTime.local().setLocale('fr').plus({ month: index }).monthLong
    let tmpArrayDay = []
    const tmpArrayHours = []
    result.sort().filter(el => dateTimeFromIsoSetLocaleFr(el).monthLong === monthNumber &&
      tmpArrayDay.push(getDayString(el)) &&
      tmpArrayHours.push({ day: getDayString(el), hour: getHoursString(el) })
    )
    tmpArrayDay = [...new Set(tmpArrayDay)]
      .map(el => ({ day: el, hours: tmpArrayHours.filter(hourSlot => hourSlot.day === el).map(itm => itm.hour) }))
    return {
      month: monthNumber,
      availableTimeSlots: tmpArrayDay,
    }
  })
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
        const end = DateTime.local().setLocale('fr').plus({ month: 3 }).endOf('month').toISO()
        const result = await api.candidat.getPlaces(selectedCenterId, begin, end)

        const formatedResult = await formatResult(result, 4)
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
        commit(CONFIRM_SELECT_DAY_SUCCESS, selected)
        dispatch(SHOW_SUCCESS, 'Votre réservation a bien été prise en compte')
      } else {
        commit(CONFIRM_SELECT_DAY_FAILURE)
        throw new Error(result.message || "La place n'est plus disponible")
      }
      dispatch(SET_MODIFYING_RESERVATION, false)
    },
  },
}
