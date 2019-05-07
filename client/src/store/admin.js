import { DateTime } from 'luxon'
import { getFrenchLuxonDateFromIso } from '../util/frenchDateTime.js'

import api from '@/api'

import { SHOW_ERROR } from '@/store'

export const FETCH_ADMIN_INFO_REQUEST = 'FETCH_ADMIN_INFO_REQUEST'
export const FETCH_ADMIN_INFO_FAILURE = 'FETCH_ADMIN_INFO_FAILURE'
export const FETCH_ADMIN_INFO_SUCCESS = 'FETCH_ADMIN_INFO_SUCCESS'

export const FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST = 'FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST'
export const FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_FAILURE = 'FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_FAILURE'
export const FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_SUCCESS = 'FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_SUCCESS'

export const FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST = 'FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST'
export const FETCH_INSPECTEURS_BY_DEPARTEMENT_FAILURE = 'FETCH_INSPECTEURS_BY_DEPARTEMENT_FAILURE'
export const FETCH_INSPECTEURS_BY_DEPARTEMENT_SUCCESS = 'FETCH_INSPECTEURS_BY_DEPARTEMENT_SUCCESS'

export const SELECT_DEPARTEMENT = 'SELECT_DEPARTEMENT'
export const SET_WEEK_SECTION = 'SET_WEEK_SECTION'

const creneauSetting = [
  { hour: '08h00', place: undefined },
  { hour: '08h30', place: undefined },
  { hour: '09h00', place: undefined },
  { hour: '09h30', place: undefined },
  { hour: '10h00', place: undefined },
  { hour: '10h30', place: undefined },
  { hour: '11h00', place: undefined },
  { hour: '11h30', place: undefined },
  { hour: '13h30', place: undefined },
  { hour: '14h00', place: undefined },
  { hour: '14h30', place: undefined },
  { hour: '15h00', place: undefined },
  { hour: '15h30', place: undefined },
]

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
    inspecteursByDepartement: {
      isFetching: false,
      error: undefined,
      list: [],
    },
    currWeek: undefined,
    centerTarget: undefined,
  },

  mutations: {
    [FETCH_ADMIN_INFO_REQUEST] (state) {
      state.departements.isFetching = true
    },
    [FETCH_ADMIN_INFO_SUCCESS] (state, infos) {
      state.departements.list = infos.departements
      state.email = infos.email
      state.departements.active = infos.departements[1]
      state.departements.isFetching = false
    },
    [FETCH_ADMIN_INFO_FAILURE] (state) {
      state.departements.isFetching = false
    },

    [FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST] (state) {
      state.placesByCentre.isFetching = true
    },
    [FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_SUCCESS] (state, list) {
      state.placesByCentre.list = list
      state.placesByCentre.isFetching = false
    },
    [FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_FAILURE] (state, error) {
      state.placesByCentre.error = error
      state.placesByCentre.isFetching = false
    },

    [FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST] (state) {
      state.inspecteursByDepartement.isFetching = true
    },
    [FETCH_INSPECTEURS_BY_DEPARTEMENT_SUCCESS] (state, list) {
      state.inspecteursByDepartement.list = list
      state.inspecteursByDepartement.isFetching = false
    },
    [FETCH_INSPECTEURS_BY_DEPARTEMENT_FAILURE] (state, error) {
      state.inspecteursByDepartement.error = error
      state.inspecteursByDepartement.isFetching = false
    },

    [SELECT_DEPARTEMENT] (state, departement) {
      state.departements.active = departement
    },

    [SET_WEEK_SECTION] (state, currWeek, centerId) {
      state.currWeek = currWeek
      state.centerTarget = centerId
    },
  },

  actions: {
    async [FETCH_ADMIN_INFO_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_ADMIN_INFO_REQUEST)
      try {
        const infos = await api.admin.getMe()
        commit(FETCH_ADMIN_INFO_SUCCESS, infos)
      } catch (error) {
        commit(FETCH_ADMIN_INFO_FAILURE)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST] ({ commit, dispatch, state }, begin, end) {
      commit(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)
      try {
        const currentDateTime = DateTime.local().setLocale('fr')
        const weekDay = currentDateTime.weekday
        const beginDate = begin || currentDateTime.plus({ days: -weekDay }).toISO()
        const endDate = end || currentDateTime.plus({ months: 2 }).toISO()
        const placesByCentre = await api.admin
          .getAllPlacesByDepartement(state.departements.active, beginDate, endDate)
        const placesByCentreAndWeek = placesByCentre.map(element => ({
          centre: element.centre,
          places: element.places.reduce((acc, place) => {
            const key = getFrenchLuxonDateFromIso(place.date).weekNumber
            const places = { ...acc }
            places[key] = [...(places[key] || []), place]
            return places
          }, {}),
        }))

        commit(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_SUCCESS, placesByCentreAndWeek)
      } catch (error) {
        commit(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_FAILURE, error)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST] ({ commit, dispatch, state }) {
      commit(FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST)
      try {
        const list = await api.admin.getInspecteursByDepartement(state.departements.active)
        const newList = list.map(elem => {
          return {
            ...elem,
            creneau: creneauSetting,
          }
        })
        commit(FETCH_INSPECTEURS_BY_DEPARTEMENT_SUCCESS, newList)
      } catch (error) {
        commit(FETCH_INSPECTEURS_BY_DEPARTEMENT_FAILURE, error)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST] ({ commit, dispatch, state }) {
      commit(FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST)
      try {
        const list = await api.admin.getInspecteursByDepartement(state.departements.active)
        const newList = list.map(elem => {
          return {
            ...elem,
            creneau: creneauSetting,
          }
        })
        commit(FETCH_INSPECTEURS_BY_DEPARTEMENT_SUCCESS, newList)
      } catch (error) {
        commit(FETCH_INSPECTEURS_BY_DEPARTEMENT_FAILURE, error)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [SELECT_DEPARTEMENT] ({ commit, dispatch }, departement) {
      commit(SELECT_DEPARTEMENT, departement)
      dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)
    },

    async [SET_WEEK_SECTION] ({ commit, dispatch }, currWeek, centerId) {
      commit(SET_WEEK_SECTION, currWeek, centerId)
    },
  },
}
