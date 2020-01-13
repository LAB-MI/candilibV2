import api from '@/api'

import { SHOW_ERROR, SHOW_SUCCESS, FETCH_ADMIN_INFO_REQUEST } from '@/store'

export const FETCH_DEPARTEMENTS_BY_ADMIN_REQUEST = 'FETCH_DEPARTEMENTS_BY_ADMIN_REQUEST'
export const FETCH_DEPARTEMENTS_BY_ADMIN_SUCCESS = 'FETCH_DEPARTEMENTS_BY_ADMIN_SUCCESS'
export const FETCH_DEPARTEMENTS_BY_ADMIN_FAILURE = 'FETCH_DEPARTEMENTS_BY_ADMIN_FAILURE'

export const UPDATE_DEPARTEMENT_REQUEST = 'UPDATE_DEPARTEMENT_REQUEST'
export const UPDATE_DEPARTEMENT_SUCCESS = 'UPDATE_DEPARTEMENT_SUCCESS'
export const UPDATE_DEPARTEMENT_FAILURE = 'UPDATE_DEPARTEMENT_FAILURE'

export const CREATE_DEPARTEMENT_REQUEST = 'CREATE_DEPARTEMENT_REQUEST'
export const CREATE_DEPARTEMENT_SUCCESS = 'CREATE_DEPARTEMENT_SUCCESS'
export const CREATE_DEPARTEMENT_FAILURE = 'CREATE_DEPARTEMENT_FAILURE'

export const DELETE_DEPARTEMENT_REQUEST = 'DELETE_DEPARTEMENT_REQUEST'
export const DELETE_DEPARTEMENT_SUCCESS = 'DELETE_DEPARTEMENT_SUCCESS'
export const DELETE_DEPARTEMENT_FAILURE = 'DELETE_DEPARTEMENT_FAILURE'

export default {
  state: {
    errorCreate: {},
    errorFetch: {},
    errorUpdate: {},
    errorDelete: {},
    isCreating: false,
    isFetching: false,
    isUpdating: false,
    isDeleting: false,
    list: [],
  },

  mutations: {
    [FETCH_DEPARTEMENTS_BY_ADMIN_REQUEST] (state) {
      state.isFetching = true
    },
    [FETCH_DEPARTEMENTS_BY_ADMIN_SUCCESS] (state, list) {
      state.list = list
      state.isFetching = false
    },
    [FETCH_DEPARTEMENTS_BY_ADMIN_FAILURE] (state, error) {
      state.errorFetch = error
      state.isFetching = false
    },

    [UPDATE_DEPARTEMENT_REQUEST] (state) {
      state.isUpdating = true
    },
    [UPDATE_DEPARTEMENT_SUCCESS] (state) {
      state.isUpdating = false
    },
    [UPDATE_DEPARTEMENT_FAILURE] (state, error) {
      state.errorUpdate = error
      state.isUpdating = false
    },

    [CREATE_DEPARTEMENT_REQUEST] (state) {
      state.isCreating = true
    },
    [CREATE_DEPARTEMENT_SUCCESS] (state) {
      state.isCreating = false
    },
    [CREATE_DEPARTEMENT_FAILURE] (state, error) {
      state.errorCreate = error
      state.isCreating = false
    },

    [DELETE_DEPARTEMENT_REQUEST] (state) {
      state.isDeleting = true
    },
    [DELETE_DEPARTEMENT_SUCCESS] (state) {
      state.isDeleting = false
    },
    [DELETE_DEPARTEMENT_FAILURE] (state, error) {
      state.errorDelete = error
      state.isDeleting = false
    },
  },

  actions: {
    async [FETCH_DEPARTEMENTS_BY_ADMIN_REQUEST] ({ commit, dispatch, state, getters }, departementId) {
      commit(FETCH_DEPARTEMENTS_BY_ADMIN_REQUEST)
      try {
        const departements = await api.admin.getDepartements(departementId || undefined)
        if (!departements.success) {
          throw new Error(departements.message)
        }
        const departementList = departements.result
        commit(FETCH_DEPARTEMENTS_BY_ADMIN_SUCCESS, departementList)
      } catch (error) {
        commit(FETCH_DEPARTEMENTS_BY_ADMIN_FAILURE, error)
        throw dispatch(SHOW_ERROR, error.message)
      }
    },

    async [UPDATE_DEPARTEMENT_REQUEST] ({ commit, dispatch, state, getters }, { departementId, newEmail }) {
      commit(UPDATE_DEPARTEMENT_REQUEST)
      try {
        const result = await api.admin.updateDepartement(departementId, newEmail)
        if (!result.success) {
          throw new Error(result.message)
        }
        commit(UPDATE_DEPARTEMENT_SUCCESS)
        dispatch(SHOW_SUCCESS, result.message)
      } catch (error) {
        commit(UPDATE_DEPARTEMENT_FAILURE, error)
        throw dispatch(SHOW_ERROR, error.message)
      }
    },

    async [CREATE_DEPARTEMENT_REQUEST] ({ commit, dispatch, state, getters }, { departementId, departementEmail }) {
      commit(CREATE_DEPARTEMENT_REQUEST)
      try {
        const result = await api.admin.createDepartement(departementId, departementEmail)
        if (!result.success) {
          throw new Error(result.message)
        }
        commit(CREATE_DEPARTEMENT_SUCCESS)
        dispatch(SHOW_SUCCESS, result.message)
        dispatch(FETCH_ADMIN_INFO_REQUEST)
      } catch (error) {
        commit(CREATE_DEPARTEMENT_FAILURE, error)
        throw dispatch(SHOW_ERROR, error.message)
      }
    },

    async [DELETE_DEPARTEMENT_REQUEST] ({ commit, dispatch, state, getters }, departementId) {
      commit(DELETE_DEPARTEMENT_REQUEST)
      try {
        const departement = await api.admin.deleteDepartement(departementId || undefined)
        if (!departement.success) {
          throw new Error(departement.message)
        }
        const message = departement.message
        commit(DELETE_DEPARTEMENT_SUCCESS)
        dispatch(SHOW_SUCCESS, message)
        dispatch(FETCH_ADMIN_INFO_REQUEST)
      } catch (error) {
        commit(DELETE_DEPARTEMENT_FAILURE, error)
        throw dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
