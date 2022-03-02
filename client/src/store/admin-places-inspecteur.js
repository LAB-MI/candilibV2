import api from '@/api'
import { SHOW_ERROR, SHOW_SUCCESS } from '@/store'
import { transformToCsv } from '@/util/createfileCSV'

export const DELETE_INSPECTEUR_PLACES_REQUEST = 'DELETE_INSPECTEUR_PLACES_REQUEST'
export const DELETE_INSPECTEUR_PLACES_SUCCESS = 'DELETE_INSPECTEUR_PLACES_SUCCESS'
export const DELETE_INSPECTEUR_PLACES_FAILURE = 'DELETE_INSPECTEUR_PLACES_FAILURE'
export const FETCH_DOWNLOAD_CANDIDATS_DELETED_REQUEST = 'FETCH_DOWNLOAD_CANDIDATS_DELETED_REQUEST'

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
    async DELETE_INSPECTEUR_PLACES_REQUEST ({ state, commit, dispatch }, { placesToDelete, askDownload, date, matricule }) {
      try {
        commit(DELETE_INSPECTEUR_PLACES_REQUEST)
        if (!placesToDelete.length) {
          throw new Error('Il n\'y a pas de place à supprimer pour cet inspecteur sur la tranche horaire sélectionnée')
        }
        const { success, message, candidats } = await api.admin.deletePlacesInspecteur(placesToDelete)
        if (!success) {
          throw new Error(message)
        }
        commit(DELETE_INSPECTEUR_PLACES_SUCCESS)
        dispatch(SHOW_SUCCESS, message)
        if (askDownload) {
          dispatch(FETCH_DOWNLOAD_CANDIDATS_DELETED_REQUEST, { candidats, date, matricule })
        }
      } catch (error) {
        commit(DELETE_INSPECTEUR_PLACES_FAILURE)
        dispatch(SHOW_ERROR, error.message)
      }
    },

    [FETCH_DOWNLOAD_CANDIDATS_DELETED_REQUEST] ({ commit, dispatch, state }, { candidats, date, matricule }) {
      const headers = [
        { text: 'NEPH', value: 'codeNeph' },
        { text: 'Nom', value: 'nomNaissance' },
        { text: 'Prénom', value: 'prenom' },
        { text: 'Courriel', value: 'email' },
        { text: 'Portable', value: 'portable' },
      ]
      const candidatsInArrays = candidats.map(creneau => headers.map(header => header.value.split('.').reduce((value, ref) => value[ref], creneau)))
      transformToCsv(headers.map(header => header.text), candidatsInArrays, date ? `${matricule}_${date.split('T')[0]}.csv` : 'candidats.csv')
    },

  },
}
