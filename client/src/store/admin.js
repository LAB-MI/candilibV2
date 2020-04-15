import {
  getFrenchLuxonFromIso,
  creneauSetting,
  getFrenchLuxonCurrentDateTime,
} from '../util'

import api from '@/api'
import {
  DEPARTEMENT_STORAGE_KEY,
  ROUTE_AUTHORIZE_AURIGE,
  ROUTE_AUTHORIZE_STATS_KPI,
  ROUTE_AUTHORIZE_AGENTS,
  ROUTE_AUTHORIZE_CENTRES,
  ROUTE_AUTHORIZE_DEPARTEMENTS,
} from '@/constants'

import { SHOW_ERROR, SHOW_SUCCESS } from '@/store'

export const FETCH_ADMIN_INFO_REQUEST = 'FETCH_ADMIN_INFO_REQUEST'
export const FETCH_ADMIN_INFO_FAILURE = 'FETCH_ADMIN_INFO_FAILURE'
export const FETCH_ADMIN_INFO_SUCCESS = 'FETCH_ADMIN_INFO_SUCCESS'

export const FETCH_IPCSR_LIST_REQUEST = 'FETCH_IPCSR_LIST_REQUEST'
export const FETCH_IPCSR_LIST_FAILURE = 'FETCH_IPCSR_LIST_FAILURE'
export const FETCH_IPCSR_LIST_SUCCESS = 'FETCH_IPCSR_LIST_SUCCESS'

export const CREATE_IPCSR_REQUEST = 'CREATE_IPCSR_REQUEST'
export const CREATE_IPCSR_FAILURE = 'CREATE_IPCSR_FAILURE'
export const CREATE_IPCSR_SUCCESS = 'CREATE_IPCSR_SUCCESS'

export const UPDATE_IPCSR_REQUEST = 'UPDATE_IPCSR_REQUEST'
export const UPDATE_IPCSR_FAILURE = 'UPDATE_IPCSR_FAILURE'
export const UPDATE_IPCSR_SUCCESS = 'UPDATE_IPCSR_SUCCESS'

export const DELETE_IPCSR_REQUEST = 'DELETE_IPCSR_REQUEST'
export const DELETE_IPCSR_FAILURE = 'DELETE_IPCSR_FAILURE'
export const DELETE_IPCSR_SUCCESS = 'DELETE_IPCSR_SUCCESS'

export const FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST = 'FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST'
export const FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_FAILURE = 'FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_FAILURE'
export const FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_SUCCESS = 'FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_SUCCESS'

export const FETCH_INSPECTEURS_BY_CENTRE_REQUEST = 'FETCH_INSPECTEURS_BY_CENTRE_REQUEST'
export const FETCH_INSPECTEURS_BY_CENTRE_FAILURE = 'FETCH_INSPECTEURS_BY_CENTRE_FAILURE'
export const FETCH_INSPECTEURS_BY_CENTRE_SUCCESS = 'FETCH_INSPECTEURS_BY_CENTRE_SUCCESS'

export const FETCH_ALL_CENTERS_REQUEST = 'FETCH_ALL_CENTERS_REQUEST'
export const FETCH_ALL_CENTERS_SUCCESS = 'FETCH_ALL_CENTERS_SUCCESS'
export const FETCH_ALL_CENTERS_FAILURE = 'FETCH_ALL_CENTERS_FAILURE'

export const DELETE_PLACE_REQUEST = 'DELETE_PLACE_REQUEST'
export const DELETE_PLACE_SUCCESS = 'DELETE_PLACE_SUCCESS'
export const DELETE_PLACE_FAILURE = 'DELETE_PLACE_FAILURE'

export const CREATE_PLACE_REQUEST = 'CREATE_PLACE_REQUEST'
export const CREATE_PLACE_SUCCESS = 'CREATE_PLACE_SUCCESS'
export const CREATE_PLACE_FAILURE = 'CREATE_PLACE_FAILURE'

export const ASSIGN_CANDIDAT_TO_CRENEAU = 'ASSIGN_CANDIDAT_TO_CRENEAU'

export const DELETE_BOOKED_PLACE_REQUEST = 'DELETE_BOOKED_PLACE_REQUEST'
export const DELETE_BOOKED_PLACE_SUCCESS = 'DELETE_BOOKED_PLACE_SUCCESS'
export const DELETE_BOOKED_PLACE_FAILURE = 'DELETE_BOOKED_PLACE_FAILURE'

export const SEND_RESET_LINK_REQUEST = 'SEND_RESET_LINK_REQUEST'
export const SEND_RESET_LINK_SUCCESS = 'SEND_RESET_LINK_SUCCESS'
export const SEND_RESET_LINK_FAILURE = 'SEND_RESET_LINK_FAILURE'

export const RESET_PASSWORD_REQUEST = 'RESET_PASSWORD_REQUEST'
export const RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS'
export const RESET_PASSWORD_FAILURE = 'RESET_PASSWORD_FAILURE'

export const MODIFY_CENTER_REQUEST = 'MODIFY_CENTER_REQUEST'
export const MODIFY_CENTER_SUCCESS = 'MODIFY_CENTER_SUCCESS'
export const MODIFY_CENTER_FAILURE = 'MODIFY_CENTER_FAILURE'

export const CREATE_CENTER_REQUEST = 'CREATE_CENTER_REQUEST'
export const CREATE_CENTER_SUCCESS = 'CREATE_CENTER_SUCCESS'
export const CREATE_CENTER_FAILURE = 'CREATE_CENTER_FAILURE'

export const SELECT_DEPARTEMENT = 'SELECT_DEPARTEMENT'
export const SET_WEEK_SECTION = 'SET_WEEK_SECTION'

export const CALCULATE_TOTAL_PLACES_FOR_ALL_CENTERS = 'CALCULATE_TOTAL_PLACES_FOR_ALL_CENTERS'
export const DELETE_TOTAL_PLACES_FOR_ALL_CENTERS = 'DELETE_TOTAL_PLACES_FOR_ALL_CENTERS'

export const numberOfMonthsToFetch = 3

const AUTHORIZED_ROUTES = {
  agents: ROUTE_AUTHORIZE_AGENTS,
  aurige: ROUTE_AUTHORIZE_AURIGE,
  'stats-kpi': ROUTE_AUTHORIZE_STATS_KPI,
  centres: ROUTE_AUTHORIZE_CENTRES,
  departements: ROUTE_AUTHORIZE_DEPARTEMENTS,
}

export default {
  getters: {
    creneauSetup: () => {
      return creneauSetting.map(hour => ({ hour }))
    },
    activeDepartement: state => {
      return state.departements.active
    },
    emailDepartementActive: state => {
      if (!state.departements.emails.length) {
        return state.email
      }
      const selectedEmail = state.departements.emails.find(
        el => el && el._id === state.departements.active,
      )
      return (selectedEmail && selectedEmail.email) || state.email
    },
    countPlacesForAllCenters: state => {
      return state.countPlacesForAllCenters
    },
  },

  state: {
    countPlacesForAllCenters: {
      totalBookedPlaces: 0,
      totalPlaces: 0,
    },
    centres: {
      isFetching: false,
      isUpdating: false,
      isCreating: false,
      error: undefined,
      list: [],
    },
    departements: {
      active: undefined,
      emails: [],
      error: undefined,
      isFetching: false,
      list: [],
    },
    email: undefined,
    status: undefined,
    features: undefined,
    places: {
      created: undefined,
      deleted: undefined,
      isCreating: false,
      isDeletingBookedPlace: false,
      isDeletingAvailablePlace: false,
      isFetching: false,
      list: [],
    },
    inspecteurs: {
      created: undefined,
      deleted: undefined,
      error: undefined,
      isFetching: false,
      isCreating: false,
      isDeleting: false,
      list: [],
    },
    currentWeek: undefined,
    isFetchingCandidat: false,
    isSendingResetLink: false,
    isSendingResetPassword: false,
  },

  mutations: {
    [FETCH_ADMIN_INFO_REQUEST] (state) {
      state.departements.isFetching = true
    },
    [FETCH_ADMIN_INFO_SUCCESS] (state, infos) {
      const {
        email,
        departements,
        status,
        features,
        emailsDepartements,
      } = infos

      state.departements.list = departements
      state.email = email
      state.status = status
      state.features =
        features && features.map(feature => AUTHORIZED_ROUTES[feature])

      const activeDepartement = localStorage.getItem(DEPARTEMENT_STORAGE_KEY)

      state.departements.active = activeDepartement || departements[0]
      state.departements.emails = emailsDepartements || []
      state.departements.isFetching = false
    },
    [FETCH_ADMIN_INFO_FAILURE] (state) {
      state.departements.isFetching = false
    },

    [FETCH_IPCSR_LIST_REQUEST] (state) {
      state.inspecteurs.isFetching = true
    },
    [FETCH_IPCSR_LIST_SUCCESS] (state, list) {
      state.inspecteurs.list = list
      state.inspecteurs.isFetching = false
    },
    [FETCH_IPCSR_LIST_FAILURE] (state) {
      state.inspecteurs.isFetching = false
    },

    [CREATE_IPCSR_REQUEST] (state) {
      state.inspecteurs.error = undefined
      state.inspecteurs.isCreating = true
    },
    [CREATE_IPCSR_SUCCESS] (state, ipcsr) {
      state.inspecteurs.created = ipcsr
      state.inspecteurs.isCreating = false
    },
    [CREATE_IPCSR_FAILURE] (state, error) {
      state.inspecteurs.error = error
      state.inspecteurs.isCreating = false
    },

    [UPDATE_IPCSR_REQUEST] (state) {
      state.inspecteurs.error = undefined
      state.inspecteurs.isCreating = true
    },
    [UPDATE_IPCSR_SUCCESS] (state, ipcsr) {
      state.inspecteurs.updated = ipcsr
      state.inspecteurs.isCreating = false
    },
    [UPDATE_IPCSR_FAILURE] (state, error) {
      state.inspecteurs.error = error
      state.inspecteurs.isCreating = false
    },

    [DELETE_IPCSR_REQUEST] (state) {
      state.inspecteurs.isDeleting = true
    },
    [DELETE_IPCSR_SUCCESS] (state, ipcsr) {
      state.inspecteurs.deleted = ipcsr
      state.inspecteurs.isDeleting = false
    },
    [DELETE_IPCSR_FAILURE] (state, error) {
      state.inspecteurs.error = error
      state.inspecteurs.isDeleting = false
    },

    [FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST] (state) {
      state.places.isFetching = true
    },
    [FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_SUCCESS] (state, list) {
      state.places.list = list
      state.places.isFetching = false
    },
    [FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_FAILURE] (state, error) {
      state.places.error = error
      state.places.isFetching = false
    },

    [FETCH_INSPECTEURS_BY_CENTRE_REQUEST] (state) {
      state.inspecteurs.isFetching = true
    },
    [FETCH_INSPECTEURS_BY_CENTRE_SUCCESS] (state, list) {
      state.inspecteurs.list = list
      state.inspecteurs.isFetching = false
    },
    [FETCH_INSPECTEURS_BY_CENTRE_FAILURE] (state, error) {
      state.inspecteurs.error = error
      state.inspecteurs.isFetching = false
    },

    [FETCH_ALL_CENTERS_REQUEST] (state) {
      state.centres.isFetching = true
    },
    [FETCH_ALL_CENTERS_SUCCESS] (state, list) {
      state.centres.list = list
      state.centres.isFetching = false
    },
    [FETCH_ALL_CENTERS_FAILURE] (state, error) {
      state.centres.error = error
      state.centres.isFetching = false
    },

    [DELETE_PLACE_REQUEST] (state) {
      state.places.isDeletingAvailablePlace = true
    },
    [DELETE_PLACE_SUCCESS] (state, success) {
      state.deleted = success
      state.places.isDeletingAvailablePlace = false
    },
    [DELETE_PLACE_FAILURE] (state, error) {
      state.deleted = error
      state.places.isDeletingAvailablePlace = false
    },

    [CREATE_PLACE_REQUEST] (state) {
      state.places.isCreating = true
    },
    [CREATE_PLACE_SUCCESS] (state, success) {
      state.places.created = success
      state.places.isCreating = false
    },
    [CREATE_PLACE_FAILURE] (state, error) {
      state.places.created = error
      state.places.isCreating = false
    },

    [DELETE_BOOKED_PLACE_REQUEST] (state) {
      state.isDeletingBookedPlace = true
    },
    [DELETE_BOOKED_PLACE_SUCCESS] (state, success) {
      state.deleted = success
      state.isDeletingBookedPlace = false
    },
    [DELETE_BOOKED_PLACE_FAILURE] (state, error) {
      state.deleted = error
      state.isDeletingBookedPlace = false
    },

    [SELECT_DEPARTEMENT] (state, departement) {
      state.departements.active = departement
      localStorage.setItem(DEPARTEMENT_STORAGE_KEY, departement)
    },

    [SET_WEEK_SECTION] (state, currentWeek) {
      state.currentWeek = currentWeek
    },

    [SEND_RESET_LINK_REQUEST] (state) {
      state.isSendingResetLink = true
    },
    [SEND_RESET_LINK_SUCCESS] (state) {
      state.isSendingResetLink = false
    },
    [SEND_RESET_LINK_FAILURE] (state) {
      state.isSendingResetLink = false
    },

    [RESET_PASSWORD_REQUEST] (state) {
      state.isSendingResetPassword = true
    },
    [RESET_PASSWORD_SUCCESS] (state) {
      state.isSendingResetPassword = false
    },
    [RESET_PASSWORD_FAILURE] (state) {
      state.isSendingResetPassword = false
    },

    [MODIFY_CENTER_REQUEST] (state) {
      state.centres.isUpdating = true
    },
    [MODIFY_CENTER_SUCCESS] (state) {
      state.centres.isUpdating = false
    },
    [MODIFY_CENTER_FAILURE] (state, error) {
      state.centres.error = error
      state.centres.isUpdating = false
    },

    [CREATE_CENTER_REQUEST] (state) {
      state.centres.isCreating = true
    },
    [CREATE_CENTER_SUCCESS] (state) {
      state.centres.isCreating = false
    },
    [CREATE_CENTER_FAILURE] (state, error) {
      state.centres.error = error
      state.centres.isCreating = false
    },

    [CALCULATE_TOTAL_PLACES_FOR_ALL_CENTERS] (state, coutCenterPlaces) {
      state.countPlacesForAllCenters = coutCenterPlaces
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

    async [FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST] (
      { commit, dispatch, rootState, state },
      timeWindow = {},
    ) {
      const { begin, end } = timeWindow
      commit(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)

      try {
        const currentDateTime = getFrenchLuxonCurrentDateTime()
        const beginDate = begin || currentDateTime.startOf('day').toISO()
        const endDate =
          end ||
          currentDateTime
            .plus({ months: numberOfMonthsToFetch })
            .endOf('day')
            .toISO()
        const placesByCentre = await api.admin.getAllPlacesByDepartement(
          state.departements.active,
          beginDate,
          endDate,
        )

        if (placesByCentre.success === false) {
          throw new Error(placesByCentre.message)
        }

        rootState.center.selected =
          rootState.center.selected ||
          (placesByCentre[0] && placesByCentre[0].centre)

        const count = {
          totalBookedPlaces: 0,
          totalPlaces: 0,
        }

        const placesByCentreAndWeek = Array.isArray(placesByCentre)
          ? placesByCentre.map(element => {
            count.totalPlaces += element.places.length
            count.totalBookedPlaces += element.places.filter(el => el.candidat).length
            return ({
              centre: element.centre,
              places: element.places.reduce((acc, place) => {
                const keyString = getFrenchLuxonFromIso(place.date)
                  .toISOWeekDate()
                  .split('-')
                const key = `${keyString[0]}-${keyString[1]}`
                const places = { ...acc }
                places[key] = [...(places[key] || []), place]
                return places
              }, {}),
            })
          })
          : []

        commit(
          FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_SUCCESS,
          placesByCentreAndWeek,
        )
        commit(CALCULATE_TOTAL_PLACES_FOR_ALL_CENTERS, count)
      } catch (error) {
        commit(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_FAILURE, error)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [FETCH_INSPECTEURS_BY_CENTRE_REQUEST] (
      { commit, dispatch, state, getters },
      centreIdAndDate,
    ) {
      const { centreId, begin, end } = centreIdAndDate
      commit(FETCH_INSPECTEURS_BY_CENTRE_REQUEST)
      try {
        const list = await api.admin.getInspecteursByCentreAndDate(
          centreId,
          begin,
          end,
        )
        const newList = list.map(elem => {
          return {
            ...elem,
            creneau: getters.creneauSetup,
          }
        })
        commit(FETCH_INSPECTEURS_BY_CENTRE_SUCCESS, newList)
      } catch (error) {
        commit(FETCH_INSPECTEURS_BY_CENTRE_FAILURE, error)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [FETCH_IPCSR_LIST_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_IPCSR_LIST_REQUEST)
      try {
        const { ipcsr } = await api.admin.getInspecteurs()
        commit(FETCH_IPCSR_LIST_SUCCESS, ipcsr)
      } catch (error) {
        commit(FETCH_IPCSR_LIST_FAILURE, error)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [CREATE_IPCSR_REQUEST] ({ commit, dispatch }, newIpcsr) {
      commit(CREATE_IPCSR_REQUEST)
      try {
        const { ipcsr, success, message } = await api.admin.createInspecteur(newIpcsr)
        if (success === false) {
          throw new Error(message)
        }
        commit(CREATE_IPCSR_SUCCESS, ipcsr)
      } catch (error) {
        commit(CREATE_IPCSR_FAILURE, error)
        throw error
      }
    },

    async [UPDATE_IPCSR_REQUEST] ({ commit, dispatch }, ipcsrToUpdate) {
      commit(UPDATE_IPCSR_REQUEST)
      try {
        const { ipcsr, success, message } = await api.admin.updateInspecteur(ipcsrToUpdate)
        if (success === false) {
          throw new Error(message)
        }
        commit(UPDATE_IPCSR_SUCCESS, ipcsr)
      } catch (error) {
        commit(UPDATE_IPCSR_FAILURE, error)
        throw error
      }
    },

    async [DELETE_IPCSR_REQUEST] ({ commit, dispatch }, id) {
      commit(DELETE_IPCSR_REQUEST)
      try {
        const { ipcsr, message, success } = await api.admin.disableInspecteur(id)
        if (!success) {
          throw new Error(message)
        }
        commit(DELETE_IPCSR_SUCCESS, ipcsr)
      } catch (error) {
        commit(DELETE_IPCSR_FAILURE, error)
        dispatch(SHOW_ERROR, error.message)
        throw error
      }
    },

    async [FETCH_ALL_CENTERS_REQUEST] ({ commit }) {
      commit(FETCH_ALL_CENTERS_REQUEST)
      try {
        const { centres } = await api.admin.getAllCentres()
        commit(FETCH_ALL_CENTERS_SUCCESS, centres)
      } catch (error) {
        commit(FETCH_ALL_CENTERS_FAILURE, error)
      }
    },

    async [DELETE_BOOKED_PLACE_REQUEST] ({ commit, dispatch, state }, placeId) {
      commit(DELETE_BOOKED_PLACE_REQUEST)
      try {
        const result = await api.admin.deleteBookedPlace(placeId)
        commit(DELETE_BOOKED_PLACE_SUCCESS, result)
        dispatch(SHOW_SUCCESS, result.message)
      } catch (error) {
        commit(DELETE_BOOKED_PLACE_FAILURE, error)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [DELETE_PLACE_REQUEST] ({ commit, dispatch, state }, placeId) {
      commit(DELETE_PLACE_REQUEST)
      try {
        const result = await api.admin.deletePlace(placeId)
        if (!result.success) {
          throw new Error(result.message)
        }
        commit(DELETE_PLACE_SUCCESS, result)
        dispatch(SHOW_SUCCESS, result.message)
      } catch (error) {
        commit(DELETE_PLACE_FAILURE, error)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [CREATE_PLACE_REQUEST] ({ commit, dispatch, state }, placeData = {}) {
      const { centre, inspecteur, date } = placeData
      commit(CREATE_PLACE_REQUEST)
      try {
        const result = await api.admin.createPlace(centre, inspecteur, date)
        commit(CREATE_PLACE_SUCCESS, result)
        dispatch(SHOW_SUCCESS, result.message)
      } catch (error) {
        commit(CREATE_PLACE_FAILURE, error)
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [ASSIGN_CANDIDAT_TO_CRENEAU] ({ dispatch, state }, assignData = {}) {
      const { placeId, candidatId } = assignData
      try {
        const { success, message } = await api.admin.assignCandidatToPlace(
          placeId,
          candidatId,
          state.departements.active,
        )
        if (!success) {
          throw new Error(message)
        }
        dispatch(SHOW_SUCCESS, message)
      } catch (error) {
        return dispatch(SHOW_ERROR, error.message)
      }
    },

    async [SEND_RESET_LINK_REQUEST] ({ commit, dispatch }, email) {
      commit(SEND_RESET_LINK_REQUEST)
      try {
        const response = await api.admin.sendMailResetLink(email)
        if (response.success === false) {
          throw new Error(response.message)
        }
        commit(SEND_RESET_LINK_SUCCESS)
      } catch (error) {
        commit(SEND_RESET_LINK_FAILURE)
        dispatch(SHOW_ERROR, error.message)
        throw error
      }
    },

    async [RESET_PASSWORD_REQUEST] (
      { commit, dispatch },
      { email, hash, newPassword, confirmNewPassword },
    ) {
      commit(RESET_PASSWORD_REQUEST)
      try {
        const response = await api.admin.resetPassword(
          email,
          hash,
          newPassword,
          confirmNewPassword,
        )
        if (response.success === false) {
          throw new Error(response.message)
        }
        commit(RESET_PASSWORD_SUCCESS)
      } catch (error) {
        commit(RESET_PASSWORD_FAILURE)
        dispatch(SHOW_ERROR, error.message)
        throw error
      }
    },

    async [MODIFY_CENTER_REQUEST] ({ commit, dispatch }, { id, nom, label, adresse, lon, lat, active, geoDepartement }) {
      commit(MODIFY_CENTER_REQUEST)
      try {
        const response = await api.admin.modifyCentre({ centreId: id, nom, label, adresse, lon, lat, active, geoDepartement })
        if (response.success === false) {
          throw new Error(response.message)
        }
        commit(MODIFY_CENTER_SUCCESS)

        dispatch(FETCH_ALL_CENTERS_REQUEST)
        dispatch(SHOW_SUCCESS, response.message)
      } catch (error) {
        commit(MODIFY_CENTER_FAILURE, error)
        dispatch(SHOW_ERROR, error.message)
        throw error
      }
    },

    async [CREATE_CENTER_REQUEST] ({ commit, dispatch }, { nom, label, adresse, lon, lat, departement, geoDepartement }) {
      commit(CREATE_CENTER_REQUEST)
      try {
        const response = await api.admin.createCentre({ nom, label, adresse, lon, lat, departement, geoDepartement })
        if (response.success === false) {
          throw new Error(response.message)
        }
        commit(CREATE_CENTER_SUCCESS)
        dispatch(FETCH_ALL_CENTERS_REQUEST)
        dispatch(SHOW_SUCCESS, response.message)
      } catch (error) {
        commit(CREATE_CENTER_FAILURE, error)
        dispatch(SHOW_ERROR, error.message)
        throw error
      }
    },

    [SELECT_DEPARTEMENT] ({ commit }, departement) {
      commit(SELECT_DEPARTEMENT, departement)
    },

    [SET_WEEK_SECTION] ({ commit }, currentWeek) {
      commit(SET_WEEK_SECTION, currentWeek)
    },
  },
}
