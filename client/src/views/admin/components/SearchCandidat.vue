<template>
  <div>
    <div class="u-flex u-flex--center">
      <candilib-autocomplete
        class="search-input"
        @selection="displayCandidatInfo"
        label="Candidats"
        hint="Chercher un candidat par son nom / NEPH / email"
        placeholder="Dupont"
        :items="candidats"
        item-text="nomNaissance"
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
    <profile-info
      title= 'Informations candidats'
      v-if="profileInfo"
      :profileInfo="profileInfo"
    />
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
import { getFrenchDateFromIso } from '../../../util/frenchDateTime.js'
import { transformToProfileInfo } from '@/util'

const transformBoolean = value => value ? 'Oui' : 'Non'
const isReussitePratiqueExist = value => value || ''
const convertToLegibleDate = date => date ? getFrenchDateFromIso(date) : 'Non renseignée'
const placeReserve = (place) => {
  if (place == null) {
    return '-'
  }
  const { inspecteur, centre, date } = place
  const nameInspecteur = inspecteur.nom
  const examCentre = centre.nom
  const frenchDate = convertToLegibleDate(date)
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
  return '<ol>' + places.map(({ date, archiveReason, byUser, archivedAt }) => {
    const frenchDate = convertToLegibleDate(date)
    const actionDate = convertToLegibleDate(archivedAt)
    return `<li>Place du ${frenchDate} : ${archiveReason} par ${byUser || 'le candidat'} le  ${actionDate}</li>`
  }).join('') + '</ol>'
}
const candidatProfileInfoDictionary = [
  [['codeNeph', 'NEPH'], ['nomNaissance', 'Nom'], ['prenom', 'Prenom']],
  [['email', 'Email'], ['portable', 'Portable'], ['adresse', ' Adresse']],
  [
    ['presignedUpAt', 'Inscrit le', convertToLegibleDate],
    ['isValidatedByEmail', 'Email validé', transformBoolean],
    ['isValidatedByAurige', 'Statut Aurige', transformBoolean],
    ['canBookFrom', 'Réservation possible dès le', convertToLegibleDate],
    ['place', 'Réservation', placeReserve],
    ['dateReussiteETG', 'ETG', convertToLegibleDate],
    ['noReussites', 'Non réussites', legibleNoReussites],
    ['nbEchecsPratiques', 'Nombre d\'échec(s)'],
    ['reussitePratique', 'Réussite Pratique', isReussitePratiqueExist],

  ],
  [ ['resaCanceledByAdmin', 'Dernier annulation par l\'administration', convertToLegibleDate],
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
    candidats: state => state.adminSearch.candidats.list,
    candidat: state => state.adminSearch.candidats.selected,
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
