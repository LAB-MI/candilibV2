<template>
  <div>
    <autocomplete-profile
      class="search-input"
      @selection="displayCandidatInfo"
      label="Candidats"
      hint="Chercher un candidat par son nom / NEPH / email"
      placeholder="Dupont"
      :itemsProfile="candidats"
      itemText="nomNaissance"
      itemValue="_id"
      :fetchAutocompleteProfile="fetchAutocompleteProfile"
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
import AutocompleteProfile from './AutocompleteProfile'
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
    AutocompleteProfile,
    ProfileInfo,
  },

  data () {
    return {
      profileInfo: undefined,
      fetchAutocompleteProfile: FETCH_AUTOCOMPLETE_CANDIDATS_REQUEST,

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
