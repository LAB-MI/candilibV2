import api from '@/api'
import { SHOW_ERROR, SHOW_SUCCESS } from './message'

export const CREATE_TECHNICAL_USER_REQUEST = 'CREATE_TECHNICAL_USER_REQUEST'
export const CREATE_TECHNICAL_USER_SUCCESS = 'CREATE_TECHNICAL_USER_SUCCESS'
export const CREATE_TECHNICAL_USER_FAILURE = 'CREATE_TECHNICAL_USER_FAILURE'

export const FETCH_TECHNICAL_USER_LIST_REQUEST = 'FETCH_TECHNICAL_USER_LIST_REQUEST'
export const FETCH_TECHNICAL_USER_LIST_SUCCESS = 'FETCH_TECHNICAL_USER_LIST_SUCCESS'
export const FETCH_TECHNICAL_USER_LIST_FAILURE = 'FETCH_TECHNICAL_USER_LIST_FAILURE'

export const DELETE_TECHNICAL_USER_REQUEST = 'DELETE_TECHNICAL_USER_REQUEST'
export const DELETE_TECHNICAL_USER_SUCCESS = 'DELETE_TECHNICAL_USER_SUCCESS'
export const DELETE_TECHNICAL_USER_FAILURE = 'DELETE_TECHNICAL_USER_FAILURE'

export const FETCH_ARCHIVED_TECHNICAL_USER_LIST_REQUEST = 'FETCH_ARCHIVED_TECHNICAL_USER_LIST_REQUEST'
export const FETCH_ARCHIVED_TECHNICAL_USER_LIST_SUCCESS = 'FETCH_ARCHIVED_TECHNICAL_USER_LIST_SUCCESS'
export const FETCH_ARCHIVED_TECHNICAL_USER_LIST_FAILURE = 'FETCH_ARCHIVED_TECHNICAL_USER_LIST_FAILURE'

export default {
  state: {
    list: [],
    archivedTechnicalUsersList: [],
    isFetchingArchivedTechnicalUsers: false,
    isSendingTechnicalUser: false,
    isFetchingTechnicalUsers: false,

  },

  mutations: {
    CREATE_TECHNICAL_USER_REQUEST (state) {
      state.isSendingTechnicalUser = true
    },
    CREATE_TECHNICAL_USER_SUCCESS (state) {
      state.isSendingTechnicalUser = false
    },
    CREATE_TECHNICAL_USER_FAILURE (state) {
      state.user = undefined
      state.isSendingTechnicalUser = false
    },

    FETCH_TECHNICAL_USER_LIST_REQUEST (state) {
      state.isFetchingTechnicalUsers = true
    },
    FETCH_TECHNICAL_USER_LIST_SUCCESS (state, list) {
      state.isFetchingTechnicalUsers = false
      state.list = list
    },
    FETCH_TECHNICAL_USER_LIST_FAILURE (state, error) {
      state.isFetchingTechnicalUsers = false
    },

    FETCH_ARCHIVED_TECHNICAl_USER_LIST_REQUEST (state) {
      state.isFetchingArchivedTechnicalUsers = true
    },
    FETCH_ARCHIVED_TECHNICAl_USER_LIST_SUCCESS (state, list) {
      state.archivedTechnicalUsersList = list
      state.isFetchingArchivedTechnicalUsers = false
    },
    FETCH_ARCHIVED_TECHNICAl_USER_LIST_FAILURE (state, error) {
      state.isFetchingArchivedTechnicalUsers = false
    },
  },

  actions: {
    async [CREATE_TECHNICAL_USER_REQUEST] ({ commit, dispatch }, user) {
      commit(CREATE_TECHNICAL_USER_REQUEST)
      try {
        const response = await api.admin.createTechnicalUser(user)
        if (response.success === false) {
          throw new Error(response.message)
        }
        commit(CREATE_TECHNICAL_USER_SUCCESS)
        dispatch(SHOW_SUCCESS, 'L\'utilisateur technique a bien été créé')
        dispatch(FETCH_TECHNICAL_USER_LIST_REQUEST)
        return response
      } catch (error) {
        commit(CREATE_TECHNICAL_USER_FAILURE)
        dispatch(SHOW_ERROR, error.message)
        throw error
      }
    },

    async [FETCH_TECHNICAL_USER_LIST_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_TECHNICAL_USER_LIST_REQUEST)
      try {
        const list = await api.admin.getTechnicalUsers()
        if (!list || list.success === false) {
          throw new Error('Vous n\'êtes pas autorisé à voir les utilisateurs')
        }
        commit(FETCH_TECHNICAL_USER_LIST_SUCCESS, list.users)
      } catch (error) {
        commit(FETCH_TECHNICAL_USER_LIST_FAILURE)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [FETCH_ARCHIVED_TECHNICAL_USER_LIST_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_ARCHIVED_TECHNICAL_USER_LIST_REQUEST)
      try {
        const list = await api.admin.getArchivedUsers()
        if (!list || list.success === false) {
          throw new Error('Vous n\'êtes pas autorisé à voir les utilisateurs')
        }
        commit(FETCH_ARCHIVED_TECHNICAL_USER_LIST_SUCCESS, list.users)
      } catch (error) {
        commit(FETCH_ARCHIVED_TECHNICAL_USER_LIST_FAILURE)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    // async [DELETE_TECHNICAL_USER_REQUEST] ({ commit, dispatch }, email) {
    //   commit(DELETE_TECHNICAL_USER_REQUEST)
    //   try {
    //     const result = await api.admin.deleteUser(email)
    //     commit(DELETE_TECHNICAL_USER_SUCCESS, email)
    //     dispatch(SHOW_SUCCESS, `${result.email} supprimé de la liste et archivé`)
    //   } catch (error) {
    //     commit(DELETE_TECHNICAL_USER_FAILURE)
    //     return dispatch(SHOW_ERROR, error.message)
    //   }
    // },
  },
}
