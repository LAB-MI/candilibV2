import api from '@/api'
import { SHOW_ERROR, SHOW_SUCCESS } from '@/store'

export const DELETE_INSPECTEUR_PLACES_REQUEST = 'DELETE_INSPECTEUR_PLACES_REQUEST'
export const DELETE_INSPECTEUR_PLACES_SUCCESS = 'DELETE_INSPECTEUR_PLACES_SUCCESS'
export const DELETE_INSPECTEUR_PLACES_FAILURE = 'DELETE_INSPECTEUR_PLACES_FAILURE'

export default {
  state: {
    isDeleting: false,
    error: undefined,
    result: undefined,
  },

  mutations: {
    DELETE_INSPECTEUR_PLACES_REQUEST (state) {
      state.isDeleting = true
    },
    DELETE_INSPECTEUR_PLACES_SUCCESS (state, result) {
      state.isDeleting = false
      state.result = result
    },
    DELETE_INSPECTEUR_PLACES_FAILURE (state, error) {
      state.isDeleting = false
      state.error = error
    },
  },

  actions: {
    async DELETE_INSPECTEUR_PLACES_REQUEST ({ state, commit, dispatch }, placesToDelete) {
      try {
        commit(DELETE_INSPECTEUR_PLACES_REQUEST)
        if (!placesToDelete.length) {
          throw new Error(`Il n'y a pas de place à supprimer pour cette cette inspecteur sur la tranche horraire selectionée`)
        }
        const result = await api.admin.deletePlacesInspecteur(placesToDelete)
        console.log({ result })
        commit(DELETE_INSPECTEUR_PLACES_SUCCESS, result)
        dispatch(SHOW_SUCCESS, result)
      } catch (error) {
        commit(DELETE_INSPECTEUR_PLACES_FAILURE, error)
        dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
