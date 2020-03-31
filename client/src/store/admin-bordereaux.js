import api from '@/api'

import { SHOW_ERROR, SHOW_SUCCESS } from '@/store'

export const GENERATE_INSPECTOR_BORDEREAUX_REQUEST =
  'GENERATE_INSPECTOR_BORDEREAUX_REQUEST'
export const GENERATE_INSPECTOR_BORDEREAUX_SUCCESS =
  'GENERATE_INSPECTOR_BORDEREAUX_SUCCESS'
export const GENERATE_INSPECTOR_BORDEREAUX_FAILURE =
  'GENERATE_INSPECTOR_BORDEREAUX_FAILURE'

export const FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST =
  'FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST'
export const FETCH_INSPECTEURS_BY_DEPARTEMENT_SUCCESS =
  'FETCH_INSPECTEURS_BY_DEPARTEMENT_SUCCESS'
export const FETCH_INSPECTEURS_BY_DEPARTEMENT_FAILURE =
  'FETCH_INSPECTEURS_BY_DEPARTEMENT_FAILURE'

export const MATCH_INSPECTEURS_IN_LIST_REQUEST =
  'MATCH_INSPECTEURS_IN_LIST_REQUEST'
export const MATCH_INSPECTEURS_IN_LIST_SUCCESS =
  'MATCH_INSPECTEURS_IN_LIST_SUCCESS'
export const MATCH_INSPECTEURS_IN_LIST_FAILURE =
  'MATCH_INSPECTEURS_IN_LIST_FAILURE'

export default {
  state: {
    isGenerating: false,

    inspecteursOfCurrentDpt: {
      error: undefined,
      isFetching: false,
      list: [],
    },

    matchInspecteurList: {
      error: undefined,
      isFetching: false,
      list: [],
    },
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

    [FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST] (state) {
      state.inspecteursOfCurrentDpt.isFetching = true
    },
    [FETCH_INSPECTEURS_BY_DEPARTEMENT_SUCCESS] (state, list) {
      state.inspecteursOfCurrentDpt.list = list
      state.inspecteursOfCurrentDpt.isFetching = false
    },
    [FETCH_INSPECTEURS_BY_DEPARTEMENT_FAILURE] (state, error) {
      state.inspecteursOfCurrentDpt.error = error
      state.inspecteursOfCurrentDpt.isFetching = false
    },

    [MATCH_INSPECTEURS_IN_LIST_REQUEST] (state) {
      state.matchInspecteurList.isFetching = true
    },
    [MATCH_INSPECTEURS_IN_LIST_SUCCESS] (state, list) {
      state.matchInspecteurList.list = list
      state.matchInspecteurList.isFetching = false
    },
    [MATCH_INSPECTEURS_IN_LIST_FAILURE] (state, error) {
      state.matchInspecteurList.error = error
      state.matchInspecteurList.isFetching = false
    },
  },

  actions: {
    async [GENERATE_INSPECTOR_BORDEREAUX_REQUEST] ({ commit, dispatch }, infos) {
      const { departement, date, isForInspecteurs, inspecteurIdListe } = infos
      commit(GENERATE_INSPECTOR_BORDEREAUX_REQUEST)
      try {
        const { success } = await api.admin.generateBordereaux(
          departement,
          date,
          isForInspecteurs,
          inspecteurIdListe,
        )
        if (!success) {
          throw new Error(
            "Un problème s'est produit lors de l'envoi des courriels",
          )
        }
        commit(GENERATE_INSPECTOR_BORDEREAUX_SUCCESS)
        dispatch(SHOW_SUCCESS, 'Les emails ont bien été envoyés')
      } catch (error) {
        commit(GENERATE_INSPECTOR_BORDEREAUX_FAILURE)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST] (
      { commit, dispatch, getters },
      date,
    ) {
      commit(FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST)
      try {
        const inspecteurs = await api.admin.getInspecteursBookedByDepartement(
          date,
          getters.activeDepartement,
        )
        if (!inspecteurs.success) {
          throw new Error(
            "Un problème s'est produit lors de la récupération de la liste des inspecteurs pour l'envoi de bordereaux",
          )
        }
        const inspecteurList = inspecteurs.results
        commit(FETCH_INSPECTEURS_BY_DEPARTEMENT_SUCCESS, inspecteurList)
      } catch (error) {
        commit(FETCH_INSPECTEURS_BY_DEPARTEMENT_FAILURE, error)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [MATCH_INSPECTEURS_IN_LIST_REQUEST] (
      { commit, dispatch, state },
      { search, startingWith, endingWith },
    ) {
      commit(MATCH_INSPECTEURS_IN_LIST_REQUEST)
      try {
        const $search = new RegExp(`${startingWith ? '^' : ''}${search}${endingWith ? '$' : ''}`, 'i')

        const matchList = state.inspecteursOfCurrentDpt.list.filter(
          ({ inspecteur }) =>
            inspecteur.prenom.match($search) ||
            inspecteur.nom.match($search) ||
            inspecteur.matricule.match($search) ||
            inspecteur.email.match($search),
        )

        commit(MATCH_INSPECTEURS_IN_LIST_SUCCESS, matchList)
      } catch (error) {
        commit(MATCH_INSPECTEURS_IN_LIST_FAILURE, error)
        return dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
