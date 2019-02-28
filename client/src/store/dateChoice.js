
import { DateTime } from 'luxon'
import arrayTestOfDates from '@/views/candidat/components/date-choice/arrayTestOfDates'
import { SHOW_ERROR } from './message'

export const FETCH_DATES_REQUEST = 'FETCH_DATES_REQUEST'
export const FETCH_DATES_SUCCESS = 'FETCH_DATES_SUCCESS'
export const FETCH_DATES_FAILURE = 'FETCH_DATES_FAILURE'
export const SELECT_DAY = 'SELECT_DAY'
// export const SET_START_AND_END = 'SET_START_AND_END'

export default {
  state: {
    isDatesFetching: false,
    fetchedDates: [],
    selectedDay: undefined,
  },
  mutations: {
    [FETCH_DATES_REQUEST] (state) {
      state.isDatesFetching = true
    },
    [FETCH_DATES_SUCCESS] (state, dates) {
      state.isDatesFetching = false
      state.fetchedDates = dates
    },
    [FETCH_DATES_FAILURE] (state) {
      state.isDatesFetching = false
    },
    [SELECT_DAY] (state, selectedDay) {
      state.selectedDay = selectedDay
    },
  },
  actions: {
    async [FETCH_DATES_REQUEST] ({ commit, dispatch }, selectedCenter) {
      commit(FETCH_DATES_REQUEST)
      try {
        const start = DateTime.local()
        const end = DateTime.local().plus({ month: 5 })
        // function for Fetch Dates with async Api are comming soon
        // for this moment we use Array variable named arrayTestOfDates to fill content
        // params => centerId , start , end
        // startDate => dateNow
        // endDate => dateNow + 3 month
        const result = arrayTestOfDates({ selectedCenter, start, end })
        commit(FETCH_DATES_SUCCESS, result)
      } catch (error) {
        commit(FETCH_DATES_FAILURE, error.message)
        dispatch(SHOW_ERROR, error.message)
      }
    },
    [SELECT_DAY] ({ commit }, selectedDay) {
      commit(SELECT_DAY, selectedDay)
    },
  },
}
