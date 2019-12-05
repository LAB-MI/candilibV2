import api from '@/api'

import { SHOW_SUCCESS, SHOW_ERROR } from '@/store'

export const UPLOAD_PLACES_REQUEST = 'UPLOAD_PLACES_REQUEST'
export const UPLOAD_PLACES_SUCCESS = 'UPLOAD_PLACES_SUCCESS'
export const UPLOAD_PLACES_FAILURE = 'UPLOAD_PLACES_FAILURE'
const SET_LAST_FILE = 'SET_LAST_FILE'

export default {
  state: {
    isPlacesUpdating: false,
    places: [],
    lastFile: undefined,
  },
  mutations: {
    [SET_LAST_FILE] (state, file) {
      state.lastFile = file
    },
    [UPLOAD_PLACES_REQUEST] (state) {
      state.isPlacesUpdating = true
    },
    [UPLOAD_PLACES_SUCCESS] (state, places) {
      state.isPlacesUpdating = false
      state.places = places
    },
    [UPLOAD_PLACES_FAILURE] (state) {
      state.isPlacesUpdating = false
    },
  },

  actions: {
    async [UPLOAD_PLACES_REQUEST] ({ commit, dispatch }, { file, departement }) {
      commit(UPLOAD_PLACES_REQUEST)
      const data = new FormData()
      data.append('file', file)
      data.append('departement', departement)

      try {
        const result = await api.admin.uploadPlacesCSV(data)
        if (result.success === false) {
          throw new Error(result.message)
        }
        commit(UPLOAD_PLACES_SUCCESS, result.places)
        commit(SET_LAST_FILE, undefined)
        dispatch(SHOW_SUCCESS, result.message)
      } catch (error) {
        commit(UPLOAD_PLACES_FAILURE)
        commit(SET_LAST_FILE, file)
        dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
