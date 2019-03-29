import api from '@/api'

import { SHOW_SUCCESS } from '@/store'

export const FETCH_CANDIDAT_RESERVATION_REQUEST = 'FETCH_CANDIDAT_RESERVATION_REQUEST'
export const FETCH_CANDIDAT_RESERVATION_FAILURE = 'FETCH_CANDIDAT_RESERVATION_FAILURE'
export const FETCH_CANDIDAT_RESERVATION_SUCCESS = 'FETCH_CANDIDAT_RESERVATION_SUCCESS'

export const SEND_EMAIL_CANDIDAT_RESERVATION_REQUEST = 'SEND_EMAIL_CANDIDAT_RESERVATION_REQUEST'
export const SEND_EMAIL_CANDIDAT_RESERVATION_FAILURE = 'SEND_EMAIL_CANDIDAT_RESERVATION_FAILURE'
export const SEND_EMAIL_CANDIDAT_RESERVATION_SUCCESS = 'SEND_EMAIL_CANDIDAT_RESERVATION_SUCCESS'

export const DELETE_CANDIDAT_RESERVATION_REQUEST = 'DELETE_CANDIDAT_RESERVATION_REQUEST'
export const DELETE_CANDIDAT_RESERVATION_FAILURE = 'DELETE_CANDIDAT_RESERVATION_FAILURE'
export const DELETE_CANDIDAT_RESERVATION_SUCCESS = 'DELETE_CANDIDAT_RESERVATION_SUCCESS'

export const SET_MODIFYING_RESERVATION = 'SET_MODIFYING_RESERVATION'

export const PENALTY_DAYS_NUMBER = 45
export const NUMBER_OF_DAYS_BEFORE_DATE = 7

export default {
  state: {
    isDeleting: false,
    isFetching: false,
    isSending: false,
    isModifying: false,
    booked: undefined,
  },

  mutations: {
    [FETCH_CANDIDAT_RESERVATION_REQUEST] (state) {
      state.isFetching = true
    },
    [FETCH_CANDIDAT_RESERVATION_SUCCESS] (state, booked) {
      state.isFetching = false
      if ('date' in booked) {
        state.booked = booked
      } else {
        state.booked = null
      }
    },
    [FETCH_CANDIDAT_RESERVATION_FAILURE] (state) {
      state.isFetching = false
    },

    [SEND_EMAIL_CANDIDAT_RESERVATION_REQUEST] (state) {
      state.isSending = true
    },
    [SEND_EMAIL_CANDIDAT_RESERVATION_SUCCESS] (state) {
      state.isSending = false
    },
    [SEND_EMAIL_CANDIDAT_RESERVATION_FAILURE] (state) {
      state.isSending = false
    },

    [DELETE_CANDIDAT_RESERVATION_REQUEST] (state) {
      state.isDeleting = true
    },
    [DELETE_CANDIDAT_RESERVATION_SUCCESS] (state) {
      state.isDeleting = false
      state.booked = null
    },
    [DELETE_CANDIDAT_RESERVATION_FAILURE] (state) {
      state.isDeleting = false
    },

    [SET_MODIFYING_RESERVATION] (state, bool) {
      state.isModifying = bool
    },
  },

  actions: {
    async [SET_MODIFYING_RESERVATION] ({ commit }, bool) {
      commit(SET_MODIFYING_RESERVATION, bool)
    },

    async [FETCH_CANDIDAT_RESERVATION_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_CANDIDAT_RESERVATION_REQUEST)
      try {
        const response = await api.candidat.getReservations()
        if (response && response.success === false) {
          throw new Error(response.message)
        }
        commit(FETCH_CANDIDAT_RESERVATION_SUCCESS, response)
      } catch (error) {
        commit(FETCH_CANDIDAT_RESERVATION_FAILURE)
        throw error
      }
    },

    async [DELETE_CANDIDAT_RESERVATION_REQUEST] ({ commit, dispatch }) {
      commit(DELETE_CANDIDAT_RESERVATION_REQUEST)
      try {
        const result = await api.candidat.deleteReservation()
        if (result && result.success) {
          commit(DELETE_CANDIDAT_RESERVATION_SUCCESS)
          dispatch(SHOW_SUCCESS, result.message)
        } else {
          throw new Error(result.message)
        }
      } catch (error) {
        commit(DELETE_CANDIDAT_RESERVATION_FAILURE)
        throw error
      }
    },

    async [SEND_EMAIL_CANDIDAT_RESERVATION_REQUEST] ({ commit, dispatch }) {
      commit(SEND_EMAIL_CANDIDAT_RESERVATION_REQUEST)
      try {
        const result = await api.candidat.sendEmail()
        if (result && result.success) {
          commit(SEND_EMAIL_CANDIDAT_RESERVATION_SUCCESS)
          dispatch(SHOW_SUCCESS, result.message)
        } else {
          throw new Error(result.message)
        }
      } catch (error) {
        commit(SEND_EMAIL_CANDIDAT_RESERVATION_FAILURE)
        throw error
      }
    },
  },
}
