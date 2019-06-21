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
        <v-icon color = blue>face</v-icon>
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
  return `${nameInspecteur}, ${examCentre}, ${frenchDate}`
}

const candidatProfileInfoDictionary = [
  [['codeNeph', 'NEPH'], ['nomNaissance', 'Nom'], ['prenom', 'Prenom']],
  [['email', 'Email'], ['portable', 'Portable'], ['adresse', ' Adresse']],
  [
    ['presignedUpAt', 'Inscrit le', convertToLegibleDate],
    ['isValidatedbyEmail', 'Email validé', transformBoolean],
    ['isValidatedbyAurige', 'Statut Aurige', transformBoolean],
    ['canBookFrom', 'Réservation possible dès le', convertToLegibleDate],
    ['place', 'Réservation', placeReserve],
    ['dateReussiteETG', 'ETG', convertToLegibleDate],
    [
      'dateDernierEchecPratique',
      'Dernière échec pratique',
      convertToLegibleDate,
    ],
    ['reussitePratique', 'Réussite Pratique', isReussitePratiqueExist],
  ],
]

export default {
  components: {
    CandilibAutocomplete,
    ProfileInfo,
  },

  data () {
    return {
      profileInfo: undefined,
      fetchAutocompleteAction: FETCH_AUTOCOMPLETE_CANDIDATS_REQUEST,
    }
  },

  computed: mapState({
    candidats: state => state.adminSearch.candidats.list,
    candidat: state => state.adminSearch.candidats.selected,
  }),

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
  },
}
</script>
