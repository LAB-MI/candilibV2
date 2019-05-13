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

    <profile-info
      title= 'Informations candidats'
      v-if="profileInfo"
      :profileInfo="profileInfo"
    />
  </div>
</template>

<script>
import { FETCH_AUTOCOMPLETE_CANDIDATS_REQUEST } from '@/store'
import CandilibAutocomplete from './CandilibAutocomplete'
import ProfileInfo from './ProfileInfo'
import { getFrenchDateFromIso } from '../../../util/dateTimeWithSetLocale.js'
import { transformToProfileInfo } from '@/util'

const transformBoolean = value => value ? 'Oui' : 'Non'
const isReussitePratiqueExist = value => value || ''
const convertToLegibleDate = date => date ? getFrenchDateFromIso(date) : 'Non renseignée'

const candidatProfileInfoDictionary = [
  [['codeNeph', 'NEPH'], ['nomNaissance', 'Nom'], ['prenom', 'Prenom']],
  [['email', 'Email'], ['portable', 'Portable'], ['adresse', ' Adresse']],
  [
    ['presignedUpAt', 'Inscrit le', convertToLegibleDate],
    ['isValidatedbyAurige', 'Status Aurige', transformBoolean],
    ['isValidatedbyEmail', 'Email validé', transformBoolean],
    ['canBookFrom', 'Réservation possible dès le', convertToLegibleDate],
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
    displayCandidatInfo (candidat) {
      this.profileInfo = transformToProfileInfo(candidat, candidatProfileInfoDictionary)
    },
  },
}
</script>
