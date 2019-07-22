import api from '@/api'

import { SHOW_ERROR, SHOW_SUCCESS } from '@/store'

export const GENERATE_INSPECTOR_BORDEREAUX_REQUEST = 'GENERATE_INSPECTOR_BORDEREAUX_REQUEST'
export const GENERATE_INSPECTOR_BORDEREAUX_SUCCESS = 'GENERATE_INSPECTOR_BORDEREAUX_SUCCESS'
export const GENERATE_INSPECTOR_BORDEREAUX_FAILURE = 'GENERATE_INSPECTOR_BORDEREAUX_FAILURE'

export default {
  state: {
    isGenerating: false,
  },

  mutations: {
    [GENERATE_INSPECTOR_BORDEREAUX_REQUEST] (state) {
      state.isGenerating = true
    },
    [GENERATE_INSPECTOR_BORDEREAUX_SUCCESS] (state) {
      state.isGenerating = false
    },
    [GENERATE_INSPECTOR_BORDEREAUX_FAILURE] (state) {
      state.isGenerating = false
    },
  },

  actions: {
    async [GENERATE_INSPECTOR_BORDEREAUX_REQUEST] ({ commit, dispatch }, infos) {
      const { departement, date, isForInspecteurs } = infos
      commit(GENERATE_INSPECTOR_BORDEREAUX_REQUEST)
      try {
        const { success } = await api.admin.generateBordereaux(departement, date, isForInspecteurs)
        if (!success) {
          throw new Error("Un problème s'est produit lors de l'envoi des emails")
        }
        commit(GENERATE_INSPECTOR_BORDEREAUX_SUCCESS)
        dispatch(SHOW_SUCCESS, 'Les emails ont bien été envoyés')
      } catch (error) {
        commit(GENERATE_INSPECTOR_BORDEREAUX_FAILURE)
        return dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
