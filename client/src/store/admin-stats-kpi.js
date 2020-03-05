import api from '@/api'
import {
  SHOW_ERROR,
  SHOW_SUCCESS,
} from '@/store'

export const FETCH_STATS_KPI_RESULTS_EXAMS_REQUEST = 'FETCH_STATS_KPI_RESULTS_EXAMS_REQUEST'
export const FETCH_STATS_KPI_RESULTS_EXAMS_SUCCESS = 'FETCH_STATS_KPI_RESULTS_EXAMS_SUCCESS'
export const FETCH_STATS_KPI_RESULTS_EXAMS_FAILURE = 'FETCH_STATS_KPI_RESULTS_EXAMS_FAILURE'

export const FETCH_STATS_KPI_PLACES_EXAMS_REQUEST = 'FETCH_STATS_KPI_PLACES_EXAMS_REQUEST'
export const FETCH_STATS_KPI_PLACES_EXAMS_SUCCESS = 'FETCH_STATS_KPI_PLACES_EXAMS_SUCCESS'
export const FETCH_STATS_KPI_PLACES_EXAMS_FAILURE = 'FETCH_STATS_KPI_PLACES_EXAMS_FAILURE'

export const FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_REQUEST = 'FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_REQUEST'
export const FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_SUCCESS = 'FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_SUCCESS'
export const FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_FAILURE = 'FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_FAILURE'

export const FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_BY_WEEK_REQUEST = 'FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_BY_WEEK_REQUEST'
export const FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_BY_WEEK_SUCCESS = 'FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_BY_WEEK_SUCCESS'
export const FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_BY_WEEK_FAILURE = 'FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_BY_WEEK_FAILURE'

export default {
  getters: {
    isFetchingResultsExams: state => {
      return state.isFetchingResultsExams
    },
    isFetchingPlacesExams: state => {
      return state.isFetchingPlacesExams
    },
    isFetchingCandidatLeaveRetentionArea: state => {
      return state.isFetchingCandidatLeaveRetentionArea
    },
    statsCandidatLeaveRetentionArea: state => {
      return state.statsCandidatLeaveRetentionArea
    },
    statsCandidatLeaveRetentionAreaByWeek: state => {
      return state.statsCandidatLeaveRetentionAreaByWeek
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
    isFetchingCandidatLeaveRetentionArea: false,
    isFetchingCandidatLeaveRetentionAreaByWeek: false,
    statsResultsExams: undefined,
    statsPlacesExams: undefined,
    statsCandidatLeaveRetentionArea: undefined,
    statsCandidatLeaveRetentionAreaByWeek: undefined,
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
      state.isFetchingCandidatLeaveRetentionArea = true
    },
    FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_SUCCESS (state, statsKpi) {
      state.statsCandidatLeaveRetentionArea = statsKpi
    },
    FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_FAILURE (state, error) {
      state.isFetchingCandidatLeaveRetentionArea = false
    },

    FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_BY_WEEK_REQUEST (state) {
      state.isFetchingCandidatLeaveRetentionAreaByWeek = true
    },
    FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_BY_WEEK_SUCCESS (state, statsKpi) {
      state.statsCandidatLeaveRetentionAreaByWeek = statsKpi
    },
    FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_BY_WEEK_FAILURE (state, error) {
      state.isFetchingCandidatLeaveRetentionAreaByWeek = false
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
        // dispatch(SHOW_SUCCESS, response.message)
      } catch (error) {
        commit(FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_FAILURE)
        dispatch(SHOW_ERROR, error.message)
      }
    },

    async FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_BY_WEEK_REQUEST ({ state, commit, dispatch }, departement) {
      commit(FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_BY_WEEK_REQUEST)
      try {
        const {
          candidatsLeaveRetentionByWeekAndDepartement,
          success,
          message,
        } = await api.admin.exportCandidatsRetentionByWeekStatsKpi(departement)

        if (!success) {
          throw new Error(message)
        }

        commit(FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_BY_WEEK_SUCCESS, candidatsLeaveRetentionByWeekAndDepartement)
        // dispatch(SHOW_SUCCESS, message)
      } catch (error) {
        commit(FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_BY_WEEK_FAILURE)
        dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
