import { DateTime } from 'luxon'
import { getFrenchLuxonDateFromIso } from '../util/frenchDateTime.js'

import api from '@/api'

import { SHOW_ERROR, SHOW_SUCCESS } from '@/store'

export const FETCH_ADMIN_INFO_REQUEST = 'FETCH_ADMIN_INFO_REQUEST'
export const FETCH_ADMIN_INFO_FAILURE = 'FETCH_ADMIN_INFO_FAILURE'
export const FETCH_ADMIN_INFO_SUCCESS = 'FETCH_ADMIN_INFO_SUCCESS'

export const FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST = 'FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST'
export const FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_FAILURE = 'FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_FAILURE'
export const FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_SUCCESS = 'FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_SUCCESS'

export const FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST = 'FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST'
export const FETCH_INSPECTEURS_BY_DEPARTEMENT_FAILURE = 'FETCH_INSPECTEURS_BY_DEPARTEMENT_FAILURE'
export const FETCH_INSPECTEURS_BY_DEPARTEMENT_SUCCESS = 'FETCH_INSPECTEURS_BY_DEPARTEMENT_SUCCESS'

export const DELETE_RESERVATION_REQUEST = 'DELETE_RESERVATION_REQUEST'
export const DELETE_RESERVATION_FAILURE = 'DELETE_RESERVATION_FAILURE'
export const DELETE_RESERVATION_SUCCESS = 'DELETE_RESERVATION_SUCCESS'

export const DELETE_PLACE_REQUEST = 'DELETE_PLACE_REQUEST'
export const DELETE_PLACE_FAILURE = 'DELETE_PLACE_FAILURE'
export const DELETE_PLACE_SUCCESS = 'DELETE_PLACE_SUCCESS'

export const CREATE_CRENEAU_REQUEST = 'CREATE_CRENEAU_REQUEST'
export const CREATE_CRENEAU_FAILURE = 'CREATE_CRENEAU_FAILURE'
export const CREATE_CRENEAU_SUCCESS = 'CREATE_CRENEAU_SUCCESS'

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
    deleteReservationAction: {
      result: undefined,
      isDeleting: false,
    },
    deletePlaceAction: {
      result: undefined,
      isDeleting: false,
    },
    currWeek: undefined,
    centerTarget: undefined,
    createCreneau: {
      isCreating: false,
      result: undefined,
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

    [DELETE_RESERVATION_REQUEST] (state) {
      state.deleteReservationAction.isDeleting = true
    },
    [DELETE_RESERVATION_SUCCESS] (state, success) {
      state.deleteReservationAction.result = success
      state.deleteReservationAction.isDeleting = false
    },
    [DELETE_RESERVATION_FAILURE] (state, error) {
      state.deleteReservationAction.result = error
      state.deleteReservationAction.isDeleting = false
    },

    [DELETE_PLACE_REQUEST] (state) {
      state.deletePlaceAction.isDeleting = true
    },
    [DELETE_PLACE_SUCCESS] (state, success) {
      state.deletePlaceAction.result = success
      state.deletePlaceAction.isDeleting = false
    },
    [DELETE_PLACE_FAILURE] (state, error) {
      state.deletePlaceAction.result = error
      state.deletePlaceAction.isDeleting = false
    },

    [CREATE_CRENEAU_REQUEST] (state) {
      state.createCreneau.isCreating = true
    },
    [CREATE_CRENEAU_SUCCESS] (state, success) {
      state.createCreneau.result = success
      state.createCreneau.isCreating = false
    },
    [CREATE_CRENEAU_FAILURE] (state, error) {
      state.createCreneau.result = error
      state.createCreneau.isCreating = false
    },

    [CREATE_CRENEAU_REQUEST] (state) {
      state.createCreneau.isCreating = true
    },
    [CREATE_CRENEAU_SUCCESS] (state, success) {
      state.createCreneau.result = success
    },
    [CREATE_CRENEAU_FAILURE] (state, error) {
      state.createCreneau.result = error
      state.createCreneau.isCreating = false
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
        dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)
      } catch (error) {
        commit(FETCH_ADMIN_INFO_FAILURE)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST] ({ commit, dispatch, state }, begin, end, defaultDept) {
      commit(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)
      try {
        const currentDateTime = DateTime.local().setLocale('fr')
        const weekDay = currentDateTime.weekday
        const beginDate = begin || currentDateTime.plus({ days: -weekDay }).toISO()
        const endDate = end || currentDateTime.plus({ months: 2 }).toISO()
        const placesByCentre = await api.admin
          .getAllPlacesByCentre(state.departements.active, beginDate, endDate)
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

    async [DELETE_RESERVATION_REQUEST] ({ commit, dispatch, state }, placeId) {
      commit(DELETE_RESERVATION_REQUEST)
      try {
        const result = await api.admin.deleteReservation(placeId)
        commit(DELETE_RESERVATION_SUCCESS, result)
        dispatch(SHOW_SUCCESS, result.message)
      } catch (error) {
        commit(DELETE_RESERVATION_FAILURE, error)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [DELETE_PLACE_REQUEST] ({ commit, dispatch, state }, placeId) {
      commit(DELETE_PLACE_REQUEST)
      try {
        const result = await api.admin.deletePlace(placeId)
        commit(DELETE_PLACE_SUCCESS, result)
        dispatch(SHOW_SUCCESS, result.message)
      } catch (error) {
        commit(DELETE_PLACE_FAILURE, error)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [CREATE_CRENEAU_REQUEST] ({ commit, dispatch, state }, { centre, inspecteur, date }) {
      commit(CREATE_CRENEAU_REQUEST)
      try {
        const result = await api.admin.createPlace(centre, inspecteur, date)
        commit(CREATE_CRENEAU_SUCCESS, result)
        dispatch(SHOW_SUCCESS, result.message)
      } catch (error) {
        commit(CREATE_CRENEAU_FAILURE, error)
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

    async [DELETE_RESERVATION_REQUEST] ({ commit, dispatch, state }, placeId) {
      commit(DELETE_RESERVATION_REQUEST)
      try {
        const result = await api.admin.deleteReservation(placeId)
        commit(DELETE_RESERVATION_SUCCESS, result)
        dispatch(SHOW_SUCCESS, result.message)
      } catch (error) {
        commit(DELETE_RESERVATION_FAILURE, error)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [DELETE_PLACE_REQUEST] ({ commit, dispatch, state }, placeId) {
      commit(DELETE_PLACE_REQUEST)
      try {
        const result = await api.admin.deletePlace(placeId)
        commit(DELETE_PLACE_SUCCESS, result)
        dispatch(SHOW_SUCCESS, result.message)
      } catch (error) {
        commit(DELETE_PLACE_FAILURE, error)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [CREATE_CRENEAU_REQUEST] ({ commit, dispatch, state }, { centre, inspecteur, date }) {
      commit(CREATE_CRENEAU_REQUEST)
      try {
        const result = await api.admin.createPlace(centre, inspecteur, date)
        commit(CREATE_CRENEAU_SUCCESS, result)
        dispatch(SHOW_SUCCESS, result.message)
      } catch (error) {
        commit(CREATE_CRENEAU_FAILURE, error)
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
