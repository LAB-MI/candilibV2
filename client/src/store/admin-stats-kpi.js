import api from '@/api'
import { SHOW_ERROR, SHOW_SUCCESS } from '@/store'

export const FETCH_STATS_KPI_RESULTS_EXAMS_REQUEST = 'FETCH_STATS_KPI_RESULTS_EXAMS_REQUEST'
export const FETCH_STATS_KPI_RESULTS_EXAMS_SUCCESS = 'FETCH_STATS_KPI_RESULTS_EXAMS_SUCCESS'
export const FETCH_STATS_KPI_RESULTS_EXAMS_FAILURE = 'FETCH_STATS_KPI_RESULTS_EXAMS_FAILURE'

export const FETCH_STATS_KPI_PLACES_EXAMS_REQUEST = 'FETCH_STATS_KPI_PLACES_EXAMS_REQUEST'
export const FETCH_STATS_KPI_PLACES_EXAMS_SUCCESS = 'FETCH_STATS_KPI_PLACES_EXAMS_SUCCESS'
export const FETCH_STATS_KPI_PLACES_EXAMS_FAILURE = 'FETCH_STATS_KPI_PLACES_EXAMS_FAILURE'

export const FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_REQUEST = 'FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_REQUEST'
export const FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_SUCCESS = 'FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_SUCCESS'
export const FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_FAILURE = 'FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_FAILURE'

export default {
  getters: {
    isFetchingResultsExams: state => {
      return state.isFetchingResultsExams
    },
    isFetchingPlacesExams: state => {
      return state.isFetchingPlacesExams
    },
    isFetchingCandidatInRetentionArea: state => {
      return state.isFetchingCandidatInRetentionArea
    },
    statsCandidatInRetentionArea: state => {
      return state.statsCandidatInRetentionArea
    },
    statsResultsExams: state => {
      return state.statsResultsExams
    },
    statsPlacesExams: state => {
      return state.statsPlacesExams
    },
  },

  state: {
    isFetchingResultsExams: false,
    isFetchingPlacesExams: false,
    isFetchingCandidatInRetentionArea: false,
    statsResultsExams: undefined,
    statsPlacesExams: undefined,
    statsCandidatInRetentionArea: undefined,
  },

  mutations: {
    FETCH_STATS_KPI_RESULTS_EXAMS_REQUEST (state) {
      state.isFetchingResultsExams = true
    },
    FETCH_STATS_KPI_RESULTS_EXAMS_SUCCESS (state, statsKpi) {
      state.statsResultsExams = statsKpi
    },
    FETCH_STATS_KPI_RESULTS_EXAMS_FAILURE (state, error) {
      state.isFetchingResultsExams = false
    },

    FETCH_STATS_KPI_PLACES_EXAMS_REQUEST (state) {
      state.isFetchingPlacesExams = true
    },
    FETCH_STATS_KPI_PLACES_EXAMS_SUCCESS (state, statsKpi) {
      state.statsPlacesExams = statsKpi
    },
    FETCH_STATS_KPI_PLACES_EXAMS_FAILURE (state, error) {
      state.isFetchingPlacesExams = false
    },

    FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_REQUEST (state) {
      state.isFetchingCandidatInRetentionArea = true
    },
    FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_SUCCESS (state, statsKpi) {
      state.statsCandidatInRetentionArea = statsKpi
    },
    FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_FAILURE (state, error) {
      state.isFetchingCandidatInRetentionArea = false
    },
  },

  actions: {
    async FETCH_STATS_KPI_PLACES_EXAMS_REQUEST ({ state, commit, dispatch }, params) {
      const { departement, isCsv } = params
      commit(FETCH_STATS_KPI_PLACES_EXAMS_REQUEST)
      try {
        const response = await api.admin.exportPlacesExamsStatsKpi(isCsv, departement)
        commit(FETCH_STATS_KPI_PLACES_EXAMS_SUCCESS, response)
        dispatch(SHOW_SUCCESS, response.message)
      } catch (error) {
        commit(FETCH_STATS_KPI_PLACES_EXAMS_FAILURE)
        dispatch(SHOW_ERROR, error.message)
      }
    },

    async FETCH_STATS_KPI_RESULTS_EXAMS_REQUEST ({ state, commit, dispatch }, params) {
      const { beginPeriode, endPeriode, isCsv, departement } = params
      commit(FETCH_STATS_KPI_RESULTS_EXAMS_REQUEST)
      try {
        const response = await api.admin.exportResultsExamsStatsKpi(beginPeriode, endPeriode, isCsv, departement)
        commit(FETCH_STATS_KPI_RESULTS_EXAMS_SUCCESS, response)
        dispatch(SHOW_SUCCESS, response.message)
      } catch (error) {
        commit(FETCH_STATS_KPI_RESULTS_EXAMS_FAILURE)
        dispatch(SHOW_ERROR, error.message)
      }
    },

    async FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_REQUEST ({ state, commit, dispatch }, params) {
      const { beginPeriode, endPeriode, isCsv, departement } = params
      commit(FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_REQUEST)
      try {
        const response = await api.admin.exportCandidatsRetentionStatsKpi(beginPeriode, endPeriode, isCsv, departement)
        commit(FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_SUCCESS, response)
        dispatch(SHOW_SUCCESS, response.message)
      } catch (error) {
        commit(FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_FAILURE)
        dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
