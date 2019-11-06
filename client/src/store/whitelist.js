import api from '@/api'

import { SHOW_ERROR, SHOW_INFO, SHOW_SUCCESS, SHOW_WARNING } from '@/store/message'

export const FETCH_WHITELIST_REQUEST = 'FETCH_WHITELIST_REQUEST'
export const FETCH_WHITELIST_FAILURE = 'FETCH_WHITELIST_FAILURE'
export const FETCH_WHITELIST_SUCCESS = 'FETCH_WHITELIST_SUCCESS'

export const FETCH_AUTOCOMPLETE_WHITELIST_REQUEST = 'FETCH_AUTOCOMPLETE_WHITELIST_REQUEST'
export const FETCH_AUTOCOMPLETE_WHITELIST_FAILURE = 'FETCH_AUTOCOMPLETE_WHITELIST_FAILURE'
export const FETCH_AUTOCOMPLETE_WHITELIST_SUCCESS = 'FETCH_AUTOCOMPLETE_WHITELIST_SUCCESS'

export const DELETE_EMAIL_REQUEST = 'DELETE_EMAIL_REQUEST'
export const DELETE_EMAIL_FAILURE = 'DELETE_EMAIL_FAILURE'
export const DELETE_EMAIL_SUCCESS = 'DELETE_EMAIL_SUCCESS'

export const SAVE_EMAIL_REQUEST = 'SAVE_EMAIL_REQUEST'
export const SAVE_EMAIL_FAILURE = 'SAVE_EMAIL_FAILURE'
export const SAVE_EMAIL_SUCCESS = 'SAVE_EMAIL_SUCCESS'

export const SAVE_EMAIL_BATCH_REQUEST = 'SAVE_EMAIL_BATCH_REQUEST'
export const SAVE_EMAIL_BATCH_FAILURE = 'SAVE_EMAIL_BATCH_FAILURE'
export const SAVE_EMAIL_BATCH_SUCCESS = 'SAVE_EMAIL_BATCH_SUCCESS'

const messageStatuses = {
  error: SHOW_ERROR,
  info: SHOW_INFO,
  success: SHOW_SUCCESS,
  warning: SHOW_WARNING,
  warn: SHOW_WARNING,
}

export default {
  state: {
    isFetching: false,
    isUpdating: false,
    lastCreatedList: undefined,
    updateResult: undefined,
    matchingList: [],
  },

  mutations: {
    [FETCH_WHITELIST_REQUEST] (state) {
      state.isFetching = true
    },
    [FETCH_WHITELIST_SUCCESS] (state, { lastCreated }) {
      state.isFetching = false
      state.lastCreatedList = lastCreated
    },
    [FETCH_WHITELIST_FAILURE] (state) {
      state.isFetching = false
    },

    [FETCH_AUTOCOMPLETE_WHITELIST_REQUEST] (state) {
      state.isFetching = true
    },
    [FETCH_AUTOCOMPLETE_WHITELIST_SUCCESS] (state, list) {
      state.isFetching = false
      state.matchingList = list
    },
    [FETCH_AUTOCOMPLETE_WHITELIST_FAILURE] (state) {
      state.isFetching = false
    },

    [DELETE_EMAIL_REQUEST] (state) {
      state.isUpdating = true
    },
    [DELETE_EMAIL_SUCCESS] (state, _id) {
      state.matchingList = state.matchingList.filter(wl => wl._id !== _id)
      state.isUpdating = false
    },
    [DELETE_EMAIL_FAILURE] (state) {
      state.isUpdating = false
    },

    [SAVE_EMAIL_REQUEST] (state) {
      state.isUpdating = true
    },
    [SAVE_EMAIL_SUCCESS] (state) {
      state.isUpdating = false
    },
    [SAVE_EMAIL_FAILURE] (state) {
      state.isUpdating = false
    },

    [SAVE_EMAIL_BATCH_REQUEST] (state) {
      state.isUpdating = true
    },
    [SAVE_EMAIL_BATCH_SUCCESS] (state, updateResult) {
      state.isUpdating = false
      state.updateResult = updateResult
    },
    [SAVE_EMAIL_BATCH_FAILURE] (state) {
      state.isUpdating = false
    },
  },

  actions: {
    async [FETCH_WHITELIST_REQUEST] ({ commit, dispatch }, departement) {
      commit(FETCH_WHITELIST_REQUEST)
      try {
        const response = await api.admin.getWhitelist(departement)
        if (response.success === false && response.isTokenValid === false) {
          const error = new Error("Vous n'êtes plus identifié")
          error.auth = false
          throw error
        }
        commit(FETCH_WHITELIST_SUCCESS, response)
      } catch (error) {
        commit(FETCH_WHITELIST_FAILURE)
        dispatch(SHOW_ERROR, error.message)
        throw error
      }
    },

    async FETCH_AUTOCOMPLETE_WHITELIST_REQUEST ({ state, commit, rootState }, search) {
      try {
        const list = await api.admin.searchWhitelisted(
          search,
          rootState.admin.departements.active || rootState.admin.departements.list[0],
        )
        commit(FETCH_AUTOCOMPLETE_WHITELIST_SUCCESS, list)
      } catch (error) {
        commit(FETCH_AUTOCOMPLETE_WHITELIST_FAILURE, error)
      }
    },

    async [DELETE_EMAIL_REQUEST] ({ commit, dispatch }, { email, departement }) {
      commit(DELETE_EMAIL_REQUEST)
      try {
        const result = await api.admin.removeFromWhitelist(email, departement)
        commit(DELETE_EMAIL_SUCCESS, email)
        dispatch(SHOW_SUCCESS, `${result.email} supprimé de la liste blanche`)
        return dispatch(FETCH_WHITELIST_REQUEST, departement)
      } catch (error) {
        commit(DELETE_EMAIL_FAILURE)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [SAVE_EMAIL_REQUEST] ({ commit, dispatch }, { emailToAdd, departement }) {
      commit(SAVE_EMAIL_REQUEST)
      try {
        const { email, message, success, departement: dept } = await api.admin.addToWhitelist(emailToAdd, departement)
        if (success === false && message) {
          if (dept) {
            throw new Error(message)
          }
          if (message.includes('Path `email` is invalid')) {
            throw new Error(`Email invalide : '${emailToAdd}'`)
          }
        }
        await dispatch(FETCH_WHITELIST_REQUEST, departement)
        commit(SAVE_EMAIL_SUCCESS, email)
        return dispatch(SHOW_SUCCESS, `${email} ajouté à la liste blanche`)
      } catch (error) {
        commit(SAVE_EMAIL_FAILURE)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [SAVE_EMAIL_BATCH_REQUEST] ({ commit, dispatch }, { emailsToAdd, departement }) {
      commit(SAVE_EMAIL_BATCH_REQUEST)
      try {
        const { message, result, status } = await api.admin.addBatchToWhitelist(emailsToAdd, departement)
        commit(SAVE_EMAIL_BATCH_SUCCESS, result)
        dispatch(FETCH_WHITELIST_REQUEST, departement)
        return dispatch(messageStatuses[status], message)
      } catch (error) {
        commit(SAVE_EMAIL_BATCH_FAILURE)
        return dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
