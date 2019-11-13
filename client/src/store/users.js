import api from '@/api'
import { SHOW_ERROR, SHOW_SUCCESS } from './message'

export const CREATE_USER_REQUEST = 'CREATE_USER_REQUEST'
export const CREATE_USER_SUCCESS = 'CREATE_USER_SUCCESS'
export const CREATE_USER_FAILURE = 'CREATE_USER_FAILURE'

export const FETCH_USER_LIST_REQUEST = 'FETCH_USER_LIST_REQUEST'
export const FETCH_USER_LIST_SUCCESS = 'FETCH_USER_LIST_SUCCESS'
export const FETCH_USER_LIST_FAILURE = 'FETCH_USER_LIST_FAILURE'

export const DELETE_USER_REQUEST = 'DELETE_USER_REQUEST'
export const DELETE_USER_SUCCESS = 'DELETE_USER_SUCCESS'
export const DELETE_USER_FAILURE = 'DELETE_USER_FAILURE'

export default {
  state: {
    list: [],
    isArchive: false,
    isFetching: false,
    isSendingUser: false,
  },

  mutations: {
    CREATE_USER_REQUEST (state) {
      state.isSendingUser = true
    },
    CREATE_USER_SUCCESS (state, user) {
      state.isSendingUser = false
      state.user = user
    },
    CREATE_USER_FAILURE (state) {
      state.user = undefined
      state.isSendingUser = false
    },

    FETCH_USER_LIST_REQUEST (state) {
      state.isFetching = true
    },
    FETCH_USER_LIST_SUCCESS (state, list) {
      state.isFetching = false
      state.list = list
    },
    FETCH_USER_LIST_FAILURE (state, error) {
      state.isFetching = false
    },

    DELETE_USER_REQUEST (state) {
      state.isArchive = true
    },
    DELETE_USER_SUCCESS (state, email) {
      state.email = email
      state.isArchive = false
    },
    DELETE_USER_FAILURE (state, error) {
      state.isArchive = false
    },

  },
  actions: {
    async [CREATE_USER_REQUEST] ({ commit, dispatch }, user) {
      commit(CREATE_USER_REQUEST)
      try {
        const response = await api.admin.createUser(user)
        if (response.success === false) {
          throw new Error(response.message)
        }
        commit(CREATE_USER_SUCCESS, response)
        return response
      } catch (error) {
        commit(CREATE_USER_FAILURE)
        dispatch(SHOW_ERROR, error.message)
        throw error
      }
    },

    async [FETCH_USER_LIST_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_USER_LIST_REQUEST)
      try {
        const list = await api.admin.getUsers()
        if (!list || list.success === false) {
          throw new Error(`Vous n'êtes pas autorisé à voir les utilisateurs`)
        }
        commit(FETCH_USER_LIST_SUCCESS, list.users)
      } catch (error) {
        commit(FETCH_USER_LIST_FAILURE)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [DELETE_USER_REQUEST] ({ commit, dispatch }, email) {
      commit(DELETE_USER_REQUEST)
      try {
        const result = await api.admin.deleteUser(email)
        commit(DELETE_USER_SUCCESS, email)
        dispatch(SHOW_SUCCESS, `${result.email} supprimé de la liste et archivé`)
      } catch (error) {
        commit(DELETE_USER_FAILURE)
        return dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
