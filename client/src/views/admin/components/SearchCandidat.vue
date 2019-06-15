<template>
  <div>
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
        fab dark small color="primary"
        class="toggle"
        @click="toggleProfileInfo"
      >
      </v-btn>
    <profile-info
      title= 'Informations candidats'
      v-if="profileInfo"
      :profileInfo="profileInfo"
    />
  </div>
</template>

<script>
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

  computed: {
    candidats () {
      return this.$store.state.adminSearch.candidats.list
    },
  },

  methods: {
    async displayCandidatInfo ({ _id: id }) {
      await this.$store.dispatch(FETCH_CANDIDAT_INFO_REQUEST, id)
      const candidat = this.$store.state.adminSearch.candidats.selected
      this.profileInfo = transformToProfileInfo(candidat, candidatProfileInfoDictionary)
    },
    toggleProfileInfo () {
      this.profileInfo = !this.profileInfo
    },

  },
}
</script>
