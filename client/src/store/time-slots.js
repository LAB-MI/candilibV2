import api from '@/api'
import { SHOW_ERROR, SHOW_SUCCESS } from './message'
import { getFrenchLuxonFromIso, valideCreneaux, getFrenchLuxonCurrentDateTime } from '../util'
import { formatResult } from './utils'
import messages from '@/candidat'

import { SET_MODIFYING_RESERVATION, SIGN_OUT_CANDIDAT } from '@/store'

export const FETCH_DATES_REQUEST = 'FETCH_DATES_REQUEST'
export const FETCH_DATES_SUCCESS = 'FETCH_DATES_SUCCESS'
export const FETCH_DATES_FAILURE = 'FETCH_DATES_FAILURE'

export const SELECT_DAY = 'SELECT_DAY'

export const CONFIRM_SELECT_DAY_REQUEST = 'CONFIRM_SELECT_DAY_REQUEST'
export const CONFIRM_SELECT_DAY_SUCCESS = 'CONFIRM_SELECT_DAY_SUCCESS'
export const CONFIRM_SELECT_DAY_FAILURE = 'CONFIRM_SELECT_DAY_FAILURE'

export default {
  getters: {
    valideCreneaux: () => {
      return valideCreneaux
    },
  },

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
    async [FETCH_DATES_REQUEST] ({ commit, dispatch, rootState, getters }, { geoDepartement, nomCentre }) {
      commit(FETCH_DATES_REQUEST)
      try {
        const { canBookFrom, date, timeOutToRetry, dayToForbidCancel } = rootState.reservation.booked

        const now = getFrenchLuxonCurrentDateTime()
        const canBookFromLuxonObj = getFrenchLuxonFromIso(canBookFrom)

        const begin = ((!canBookFromLuxonObj || canBookFromLuxonObj < now) ? now : canBookFromLuxonObj).toISO()
        const end = getFrenchLuxonCurrentDateTime()
          .plus({ month: 3 })
          .endOf('month')
          .toISO()
        const result = await api.candidat.getPlaces(geoDepartement, nomCentre, begin, end)

        if (
          result.isTokenValid === false
        ) {
          dispatch(SIGN_OUT_CANDIDAT)
          throw new Error(messages.expired_token_message)
        }

        const anticipatedCanBookAfter =
          !getters.canCancelBooking
            ? getFrenchLuxonFromIso(date).plus({ days: timeOutToRetry })
            : false
        const numberOfMonthToDisplay = 4

        const formatedResult = formatResult(
          result,
          numberOfMonthToDisplay,
          canBookFrom,
          anticipatedCanBookAfter,
          dayToForbidCancel,
          getters.valideCreneaux,
        )
        commit(FETCH_DATES_SUCCESS, formatedResult)
      } catch (error) {
        commit(FETCH_DATES_FAILURE, error.message)
        dispatch(SHOW_ERROR, error.message)
      }
    },

    async [SELECT_DAY] ({ commit, dispatch }, selected) {
      const { slot, centre } = selected
      const result = await api.candidat.checkPlacesAvailability(undefined, centre.nom, slot, centre.geoDepartement)
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
      const result = await api.candidat.setReservations(centre.nom, centre.geoDepartement, slot, isAccompanied, hasDualControlCar)
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
