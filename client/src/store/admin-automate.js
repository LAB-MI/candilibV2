import api from '@/api'
import { SHOW_ERROR, SHOW_SUCCESS } from '.'

export const FETCH_JOBS_AUTOMATE_REQUEST = 'FETCH_JOBS_AUTOMATE_REQUEST'
export const FETCH_JOBS_AUTOMATE_SUCCESS = 'FETCH_JOBS_AUTOMATE_SUCCESS'
export const FETCH_JOBS_AUTOMATE_FAILURE = 'FETCH_JOBS_AUTOMATE_FAILURE'

export default {
  state: {
    jobs: {
      isFetching: false,
      list: [],
    },
  },
  mutations: {
    [FETCH_JOBS_AUTOMATE_REQUEST] (state) {
      state.jobs.isFetching = true
    },
    [FETCH_JOBS_AUTOMATE_SUCCESS] (state, list) {
      state.jobs.list = list
      state.jobs.isFetching = false
    },
    [FETCH_JOBS_AUTOMATE_FAILURE] (state) {
      state.jobs.isFetching = false
    },
  },
  actions: {
    async [FETCH_JOBS_AUTOMATE_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_JOBS_AUTOMATE_REQUEST)
      try {
        const result = await api.admin.getJobsAutomate()
        const { success, jobs, message } = result
        if (!success) {
          throw new Error(message)
        }
        commit(FETCH_JOBS_AUTOMATE_SUCCESS, jobs)
        dispatch(SHOW_SUCCESS, `${jobs?.length || 0} jobs`)
      } catch (error) {
        commit(FETCH_JOBS_AUTOMATE_FAILURE)
        return dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
