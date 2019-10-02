<template>
  <div>
    <div class="u-flex u-flex--center">
      <candilib-autocomplete
        class="search-input t-search-candidat"
        @selection="displayCandidatInfo"
        label="Candidats"
        hint="Chercher un candidat par son nom / NEPH / email"
        placeholder="Dupont"
        :items="candidats"
        item-text="nameNeph"
        item-value="_id"
        :fetch-autocomplete-action="fetchAutocompleteAction"
      />
      <v-btn
        icon
        :disabled="!candidat"
        color="white"
        @click="toggleProfileInfo"
      >
        <v-icon
          :color="color"
        >{{icon}}</v-icon>
      </v-btn>
    </div>
    <v-expand-transition>
    <profile-info
      class="t-result-candidat"
      title= 'Informations candidats'
      v-if="profileInfo"
      :profileInfo="profileInfo"
    />
    </v-expand-transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import {
  FETCH_AUTOCOMPLETE_CANDIDATS_REQUEST,
  FETCH_CANDIDAT_INFO_REQUEST,
} from '@/store'
import CandilibAutocomplete from './CandilibAutocomplete'
import ProfileInfo from './ProfileInfo'
import { getFrenchDateTimeFromIso, getFrenchDateFromIso } from '../../../util/frenchDateTime.js'
import { transformToProfileInfo } from '@/util'
import adminMessage from '../../../admin.js'

const transformBoolean = value => value ? 'Oui' : 'Non'
const isReussitePratiqueExist = value => value || ''
const convertToLegibleDate = date => date ? getFrenchDateFromIso(date) : adminMessage.non_renseignee
const convertToLegibleDateTime = date => date ? getFrenchDateTimeFromIso(date) : adminMessage.non_renseignee
const placeReserve = (place) => {
  if (place == null) {
    return '-'
  }
  const { inspecteur, centre, date } = place
  const nameInspecteur = inspecteur.nom
  const examCentre = centre.nom
  const frenchDate = convertToLegibleDateTime(date)
  return `${frenchDate}  -  ${examCentre}  -  ${nameInspecteur}`
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

const historiqueAction = (places) => {
  if (!places || !(places.length)) {
    return ' - '
  }
  return '<ul style="margin: 0; padding: 0;">' + places.map(({ date, archiveReason, byUser, archivedAt }) => {
    const frenchDate = convertToLegibleDateTime(date)
    const actionDate = convertToLegibleDateTime(archivedAt)
    return `<li>Place du ${frenchDate} : ${archiveReason} par ${byUser || 'le candidat'} le  ${actionDate}</li>`
  }).reverse().join('') + '</ul>'
}
const candidatProfileInfoDictionary = [
  [['codeNeph', 'NEPH'], ['nomNaissance', 'Nom'], ['prenom', 'Prenom']],
  [['email', 'Email'], ['portable', 'Portable'], ['adresse', ' Adresse']],
  [
    ['presignedUpAt', 'Inscrit le', convertToLegibleDateTime],
    ['isValidatedEmail', 'Email validé', transformBoolean],
    ['isValidatedByAurige', 'Statut Aurige', transformBoolean],
    ['canBookFrom', 'Réservation possible dès le', convertToLegibleDate],
    ['place', 'Réservation', placeReserve],
    ['dateReussiteETG', 'ETG', convertToLegibleDate],
    ['noReussites', 'Non réussites', legibleNoReussites],
    ['nbEchecsPratiques', 'Nombre d\'échec(s)'],
    ['reussitePratique', 'Réussite Pratique', isReussitePratiqueExist],

  ],
  [ ['resaCanceledByAdmin', 'Dernière annulation par l\'administration', convertToLegibleDateTime],
    ['places', 'Historique des actions', historiqueAction],
  ],
]

export default {
  components: {
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
      this.toggelInfo(newVal)
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
  },
}
</script>
