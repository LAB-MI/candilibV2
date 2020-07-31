<template>
  <div>
    <div class="u-flex u-flex--center">
      <candilib-autocomplete
        class="search-input t-search-candidat"
        label="Candidats"
        hint="Chercher un candidat par son nom / NEPH / email"
        placeholder="Dupont"
        :items="candidats"
        item-text="nameNeph"
        item-value="_id"
        :fetch-autocomplete-action="fetchAutocompleteAction"
        @selection="displayCandidatInfo"
      >
        <v-btn
          icon
          :disabled="!candidat"
          color="white"
          @click="toggleProfileInfo"
        >
          <v-icon
            :color="color"
          >
            {{ icon }}
          </v-icon>
        </v-btn>
      </candilib-autocomplete>
    </div>
    <v-expand-transition>
      <profile-info
        v-if="profileInfo"
        class="t-result-candidat"
        title="Informations Candidat"
        :subtitle="candidat.prenom + ' ' + candidat.nomNaissance + ' | ' + candidat.codeNeph"
        :profile-info="profileInfo"
      >
        <v-card class="t-result-candidat-historique-des-actions t-result-candidat-item">
          <v-card-title primary-title>
            Historique des actions&nbsp;:
          </v-card-title>
          <candidat-action-history-tab
            :items="getActionsHistory()"
          />
        </v-card>
      </profile-info>
    </v-expand-transition>
  </div>
</template>

<script>

import Vue from 'vue'

import { mapState } from 'vuex'
import { Interval } from 'luxon'
import {
  FETCH_AUTOCOMPLETE_CANDIDATS_REQUEST,
  FETCH_CANDIDAT_INFO_REQUEST,
} from '@/store'
import CandilibAutocomplete from './CandilibAutocomplete'
import ProfileInfo from './ProfileInfo'
import { getFrenchDateTimeFromIso, getFrenchDateFromIso, getFrenchLuxon, getFrenchLuxonFromIso } from '../../../util/frenchDateTime.js'
import { transformToProfileInfo } from '@/util'
import adminMessage from '../../../admin.js'
import CandidatActionHistTab from '../components/CandidatActionHistoryTab'

const transformBoolean = value => value ? '<i class="material-icons green--text">done</i>' : '<i class="material-icons red--text">close</i>'
const isReussitePratiqueExist = value => value || ''
const convertToLegibleDate = date => date ? getFrenchDateFromIso(date) : adminMessage.non_renseignee
const convertToLegibleDateTime = date => date ? getFrenchDateTimeFromIso(date) : adminMessage.non_renseignee
const placeReserve = (place) => {
  if (place == null) {
    return 'Ce candidat n\'a pas de réservation'
  }
  const { inspecteur, centre, date, bookedByAdmin, bookedAt } = place
  const nameInspecteur = inspecteur.nom
  const examCentre = centre.nom
  const examDepartement = centre.departement
  const frenchDate = convertToLegibleDateTime(date)
  const actionBookedAtDate = convertToLegibleDateTime(bookedAt)
  const bookedByAdm = `${bookedByAdmin ? ('Réservé par ' + bookedByAdmin.email + ', le ' + actionBookedAtDate)
  : ('Réservé par le Candidat, le ' + actionBookedAtDate)}`
  return `${frenchDate}  <br>  ${examCentre}  <br> ${examDepartement} <br> ${nameInspecteur} <br> ${bookedByAdm}`
}

const legibleNoReussites = (noReussites) => {
  if (!noReussites || !(noReussites.length)) {
    return '-'
  }
  return '<ol>' + noReussites.map(({ reason, date }) => {
    const frenchDate = convertToLegibleDate(date)
    return `<li>${frenchDate} : ${reason}</li>`
  }).join(' - ') + '</ol>'
}

const iconAccess = (canAccessAt) => {
  if (!canAccessAt) {
    return '<i class="material-icons green--text">done</i>'
  }
  const luxonDateCanAccessAt = getFrenchLuxonFromIso(canAccessAt)
  const today = getFrenchLuxon()
  const dayLeft = Interval.fromDateTimes(
    today,
    luxonDateCanAccessAt,
  )
    .count('days') - 1
  const result = luxonDateCanAccessAt > today ? `<i class="red--text">il reste ${dayLeft} jours</i>` : '<i class="material-icons green--text">done</i>'
  return result
}

const candidatProfileInfoDictionary = [
  [
    ['canAccessAt', 'Statut', iconAccess],
    ['canAccessAt', 'Date d\'accès', convertToLegibleDate],
  ],
  [
    ['email', 'Email', (email) => {
      Vue.component('fiche-candidat-email', () => import('./candidats/FicheCandidatEmail'))
      return { name: 'fiche-candidat-email', data: { email } }
    }, true],
    ['portable', 'Portable'],
    ['departement', ' Département'],
  ],
  [
    ['presignedUpAt', 'Inscrit le', convertToLegibleDateTime],
    ['isValidatedEmail', 'Email validé', transformBoolean],
    ['isValidatedByAurige', 'Statut Aurige', transformBoolean],
    ['canBookFrom', 'Réservation possible dès le', convertToLegibleDate],
    ['dateReussiteETG', 'ETG', convertToLegibleDate],
    ['noReussites', 'Non réussites', legibleNoReussites],
    ['nbEchecsPratiques', 'Nombre d\'échec(s)'],
    ['reussitePratique', 'Réussite Pratique', isReussitePratiqueExist],
    ['resaCanceledByAdmin', 'Dernière annulation par l\'administration', convertToLegibleDate],
  ],
  [['place', 'Réservation', placeReserve]],
]

export default {
  components: {
    CandidatActionHistoryTab: CandidatActionHistTab(),
    CandilibAutocomplete,
    ProfileInfo,
  },

  data () {
    return {
      color: '#A9A9A9',
      icon: '',
      profileInfo: undefined,
      fetchAutocompleteAction: FETCH_AUTOCOMPLETE_CANDIDATS_REQUEST,
    }
  },

  computed: mapState({
    candidat: state => state.adminSearch.candidats.selected,
    candidats: state => state.adminSearch.candidats.list
      .map(candidat => {
        const { nomNaissance, prenom, codeNeph } = candidat
        const nameNeph = nomNaissance + '  ' + prenom + ' | ' + codeNeph
        return { nameNeph, ...candidat }
      }),
  }),

  watch: {
    candidat (newVal) {
      this.profileInfo = transformToProfileInfo(newVal, candidatProfileInfoDictionary)
    },
    profileInfo (newVal) {
      this.toggelInfo(newVal)
    },
  },

  mounted () {
    const candidat = this.candidat
    const profileInfo = this.profileInfo
    this.toggelInfo(candidat, profileInfo)
  },

  methods: {
    async displayCandidatInfo ({ _id: id }) {
      await this.$store.dispatch(FETCH_CANDIDAT_INFO_REQUEST, id)
      this.profileInfo = transformToProfileInfo(this.candidat, candidatProfileInfoDictionary)
    },
    toggleProfileInfo () {
      this.profileInfo = !this.profileInfo
      if (this.profileInfo === true) {
        this.profileInfo = transformToProfileInfo(this.candidat, candidatProfileInfoDictionary)
      }
    },
    toggelInfo (candidat, profileInfo) {
      if (!candidat) {
        this.color = 'grey'
        this.icon = 'keyboard_arrow_down'
        return
      }
      this.color = 'green'
      this.icon = 'keyboard_arrow_up'
    },

    getActionsHistory () {
      const { places } = this.candidat
      if (!places || !(places.length)) {
        return []
      }
      return places.map(({ archivedAt, archiveReason, byUser, centre, date, departement, inspecteur, bookedByAdmin, bookedAt }) => {
        const frenchDate = convertToLegibleDateTime(date)
        const actionDate = convertToLegibleDateTime(archivedAt)
        const actionBookedAtDate = convertToLegibleDateTime(bookedAt)
        return {
          actionDate,
          actionDateTime: archivedAt,
          archiveReason,
          byUser: byUser || 'Le Candidat',
          centre: centre.nom,
          departement: centre.departement || '',
          frenchDate,
          frenchDateTime: date,
          inspecteur: typeof inspecteur === 'object' ? `${inspecteur.nom} | ${inspecteur.prenom}` : inspecteur,
          bookedByAdmin: bookedByAdmin ? bookedByAdmin.email : 'Le Candidat',
          bookedAt: actionBookedAtDate,
        }
      }).reverse()
    },
  },
}
</script>
