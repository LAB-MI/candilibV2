import api from '@/api'
import { SHOW_ERROR, SHOW_SUCCESS } from './message'

export const CREATE_USER_REQUEST = 'CREATE_USER_REQUEST'
export const CREATE_USER_SUCCESS = 'CREATE_USER_SUCCESS'
export const CREATE_USER_FAILURE = 'CREATE_USER_FAILURE'

export const FETCH_USER_LIST_REQUEST = 'FETCH_USER_LIST_REQUEST'
export const FETCH_USER_LIST_SUCCESS = 'FETCH_USER_LIST_SUCCESS'
export const FETCH_USER_LIST_FAILURE = 'FETCH_USER_LIST_FAILURE'

export const UPDATE_USER_REQUEST = 'UPDATE_USER_REQUEST'
export const UPDATE_USER_SUCCESS = 'UPDATE_USER_SUCCESS'
export const UPDATE_USER_FAILURE = 'UPDATE_USER_FAILURE'

export const DELETE_USER_REQUEST = 'DELETE_USER_REQUEST'
export const DELETE_USER_SUCCESS = 'DELETE_USER_SUCCESS'
export const DELETE_USER_FAILURE = 'DELETE_USER_FAILURE'

export default {
  state: {
    list: [],
    isArchive: false,
    isUpdating: false,
    isFetching: false,
    isSendingUser: false,
  },

  mutations: {
    CREATE_USER_REQUEST (state) {
      state.isSendingUser = true
    },
    CREATE_USER_SUCCESS (state) {
      state.isSendingUser = false
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

    UPDATE_USER_REQUEST (state) {
      state.isUpdating = true
    },
    UPDATE_USER_SUCCESS (state) {
      state.isUpdating = false
    },
    UPDATE_USER_FAILURE (state, error) {
      state.isUpdating = false
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
        commit(CREATE_USER_SUCCESS)
        dispatch(SHOW_SUCCESS, 'L\'utilisateur a bien été créé')
        dispatch(FETCH_USER_LIST_REQUEST)
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
          throw new Error('Vous n\'êtes pas autorisé à voir les utilisateurs')
        }
        commit(FETCH_USER_LIST_SUCCESS, list.users)
      } catch (error) {
        commit(FETCH_USER_LIST_FAILURE)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [UPDATE_USER_REQUEST] ({ commit, dispatch }, { email, status, departements }) {
      commit(UPDATE_USER_REQUEST)
      try {
        const result = await api.admin.updateUser(email, { status, departements })
        if (result.success === false) {
          throw new Error(result.message)
        }
        commit(UPDATE_USER_SUCCESS)
        dispatch(SHOW_SUCCESS, `L'utilisateur ${email} a bien été modifié`)
      } catch (error) {
        commit(UPDATE_USER_FAILURE)
        dispatch(SHOW_ERROR, error.message)
        throw error
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
