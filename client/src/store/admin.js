import { DateTime } from 'luxon'
import { getFrenchLuxonDateFromIso } from '../util/dateTimeWithSetLocale.js'

import api from '@/api'

import { SHOW_ERROR } from '@/store'

export const FETCH_ADMIN_INFO_REQUEST = 'FETCH_ADMIN_INFO_REQUEST'
export const FETCH_ADMIN_INFO_FAILURE = 'FETCH_ADMIN_INFO_FAILURE'
export const FETCH_ADMIN_INFO_SUCCESS = 'FETCH_ADMIN_INFO_SUCCESS'

export const FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST = 'FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST'
export const FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_FAILURE = 'FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_FAILURE'
export const FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_SUCCESS = 'FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_SUCCESS'

export const SELECT_DEPARTEMENT = 'SELECT_DEPARTEMENT'

export default {
  state: {
    departements: {
      active: undefined,
      error: undefined,
      isFetching: false,
      list: [],
    },
    email: undefined,
    placesByCentre: {
      isFetching: false,
      list: [],
    },
  },

  mutations: {
    [FETCH_ADMIN_INFO_REQUEST] (state) {
      state.departements.isFetching = true
    },
    [FETCH_ADMIN_INFO_SUCCESS] (state, infos) {
      state.departements.list = infos.departements
      state.email = infos.email
      state.departements.active = infos.departements[1]
    },
    [FETCH_ADMIN_INFO_FAILURE] (state) {
      state.departements.isFetching = false
    },

    [FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST] (state) {
      state.placesByCentre.isFetching = true
    },
    [FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_SUCCESS] (state, data) {
      state.placesByCentre.list = data
    },
    [FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_FAILURE] (state, error) {
      state.placesByCentre.error = error
      state.placesByCentre.isFetching = false
    },

    [SELECT_DEPARTEMENT] (state, departement) {
      state.departements.active = departement
    },
  },

  actions: {
    async [FETCH_ADMIN_INFO_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_ADMIN_INFO_REQUEST)
      try {
        const infos = await api.admin.getMe()
        await commit(FETCH_ADMIN_INFO_SUCCESS, infos)
        dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)
      } catch (error) {
        commit(FETCH_ADMIN_INFO_FAILURE)
        return dispatch(SHOW_ERROR, 'Error while fetching admin infos')
      }
    },

    async [FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST] ({ commit, dispatch, state }, begin, end) {
      commit(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)
      try {
        // DateTime.local(2017, 5, 25).weekNumber //=> 21
        const weekDay = DateTime.local().setLocale('fr').weekday
        const beginDate = begin || DateTime.local().plus({ days: -weekDay }).toISO()
        const endDate = end || DateTime.local().setLocale('fr').plus({ days: 7 * 8 }).toISO()
        let placesByCentre = await api.admin.getAllPlacesByCentre(state.departements.active, beginDate, endDate)
        // placesByCentre.map(element => {
        //   return element.places.sort((current, toCompare) => {
        //     if (getFrenchLuxonDateFromIso(current.date) < getFrenchLuxonDateFromIso(toCompare.date)) { return -1 }
        //     if (getFrenchLuxonDateFromIso(current.date) > getFrenchLuxonDateFromIso(toCompare.date)) { return 1 }
        //     return 0
        //   })
        // })
        placesByCentre = placesByCentre.map(element => {
          return {
            centre: element.centre,
            places: element.places.reduce((accumulator, currentValue) => {
              const key = getFrenchLuxonDateFromIso(currentValue['date']).weekNumber
              if (!accumulator[key]) {
                accumulator[key] = []
              }
              accumulator[key].push(currentValue)
              return accumulator
            }, {}),
          }
        })

        commit(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_SUCCESS, placesByCentre)
      } catch (error) {
        commit(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_FAILURE, error)
        return dispatch(SHOW_ERROR, 'Error while fetching departement active infos')
      }
    },

    async [SELECT_DEPARTEMENT] ({ commit, dispatch }, departement) {
      commit(SELECT_DEPARTEMENT, departement)
      dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)
    },
  },
}
