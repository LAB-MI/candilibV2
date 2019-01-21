import api from '@/api'

import { SHOW_ERROR, SHOW_SUCCESS } from '@/store'

export const FETCH_WHITELIST_REQUEST = 'FETCH_WHITELIST_REQUEST'
export const FETCH_WHITELIST_FAILURE = 'FETCH_WHITELIST_FAILURE'
export const FETCH_WHITELIST_SUCCESS = 'FETCH_WHITELIST_SUCCESS'

export const DELETE_EMAIL_REQUEST = 'DELETE_EMAIL_REQUEST'
export const DELETE_EMAIL_FAILURE = 'DELETE_EMAIL_FAILURE'
export const DELETE_EMAIL_SUCCESS = 'DELETE_EMAIL_SUCCESS'

export const SAVE_EMAIL_REQUEST = 'SAVE_EMAIL_REQUEST'
export const SAVE_EMAIL_FAILURE = 'SAVE_EMAIL_FAILURE'
export const SAVE_EMAIL_SUCCESS = 'SAVE_EMAIL_SUCCESS'

export default {
  state: {
    isFetching: false,
    isUpdating: false,
    list: undefined,
  },

  mutations: {
    [FETCH_WHITELIST_REQUEST] (state) {
      state.isFetching = true
    },
    [FETCH_WHITELIST_SUCCESS] (state, list) {
      state.isFetching = false
      state.list = list
    },
    [FETCH_WHITELIST_FAILURE] (state) {
      state.isFetching = false
    },

    [DELETE_EMAIL_REQUEST] (state) {
      state.isUpdating = true
    },
    [DELETE_EMAIL_SUCCESS] (state, ema) {
      state.isUpdating = false
    },
    [DELETE_EMAIL_FAILURE] (state) {
      state.isUpdating = false
    },

    [SAVE_EMAIL_REQUEST] (state) {
      state.isUpdating = true
    },
    [SAVE_EMAIL_SUCCESS] (state, ema) {
      state.isUpdating = false
    },
    [SAVE_EMAIL_FAILURE] (state) {
      state.isUpdating = false
    },
  },

  actions: {
    async [FETCH_WHITELIST_REQUEST] ({ commit, dispatch }, content, timeout) {
      commit(FETCH_WHITELIST_REQUEST)
      try {
        const list = await api.getWhitelist()
        commit(FETCH_WHITELIST_SUCCESS, list)
      } catch (error) {
        commit(FETCH_WHITELIST_FAILURE)
        return dispatch(SHOW_ERROR, 'Error while fetching whitelist')
      }
    },

    async [DELETE_EMAIL_REQUEST] ({ commit, dispatch }, email) {
      commit(DELETE_EMAIL_REQUEST)
      try {
        const result = await api.removeFromWhitelist(email)
        commit(DELETE_EMAIL_SUCCESS, email)
        dispatch(FETCH_WHITELIST_REQUEST)
        return dispatch(SHOW_SUCCESS, `${result.email} supprimé de la liste blanche`)
      } catch (error) {
        commit(DELETE_EMAIL_FAILURE)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [SAVE_EMAIL_REQUEST] ({ commit, dispatch }, emailToAdd) {
      commit(SAVE_EMAIL_REQUEST)
      try {
        const { email, message, success } = await api.addToWhitelist(emailToAdd)
        if (success === false && message) {
          if (message.includes('duplicate key error')) {
            throw new Error(`Email déjà existant : '${emailToAdd}'`)
          }
          if (message.includes('Path `email` is invalid')) {
            throw new Error(`Email invalide : '${emailToAdd}'`)
          }
        }
        dispatch(FETCH_WHITELIST_REQUEST)
        commit(SAVE_EMAIL_SUCCESS, email)
        return dispatch(SHOW_SUCCESS, `${email} ajouté à la liste blanche`)
      } catch (error) {
        commit(SAVE_EMAIL_FAILURE)
        return dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
