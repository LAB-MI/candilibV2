import api from '@/api'
import { SHOW_ERROR, SHOW_SUCCESS } from '@/store'

export const DELETE_INSPECTEUR_PLACES_REQUEST = 'DELETE_INSPECTEUR_PLACES_REQUEST'
export const DELETE_INSPECTEUR_PLACES_SUCCESS = 'DELETE_INSPECTEUR_PLACES_SUCCESS'
export const DELETE_INSPECTEUR_PLACES_FAILURE = 'DELETE_INSPECTEUR_PLACES_FAILURE'

export default {
  state: {
    isDeleting: false,
  },

  mutations: {
    DELETE_INSPECTEUR_PLACES_REQUEST (state) {
      state.isDeleting = true
    },
    DELETE_INSPECTEUR_PLACES_SUCCESS (state) {
      state.isDeleting = false
    },
    DELETE_INSPECTEUR_PLACES_FAILURE (state, error) {
      state.isDeleting = false
    },
  },

  actions: {
    async DELETE_INSPECTEUR_PLACES_REQUEST ({ state, commit, dispatch }, placesToDelete) {
      try {
        commit(DELETE_INSPECTEUR_PLACES_REQUEST)
        if (!placesToDelete.length) {
          throw new Error('Il n\'y a pas de place à supprimer pour cet inspecteur sur la tranche horaire sélectionnée')
        }
        const { success, message } = await api.admin.deletePlacesInspecteur(placesToDelete)
        if (!success) {
          throw new Error(message)
        }
        commit(DELETE_INSPECTEUR_PLACES_SUCCESS)
        dispatch(SHOW_SUCCESS, message)
      } catch (error) {
        commit(DELETE_INSPECTEUR_PLACES_FAILURE)
        dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
