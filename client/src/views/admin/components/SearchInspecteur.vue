<template>
  <div>
    <autocomplete-profile
      class="search-input"
      @selection="displayInspecteurInfo"
      label="Inspecteurs"
      hint="Chercher un inspecteur par son nom / matricule / email"
      placeholder="Dupond"
      :itemsProfile="inspecteurs"
      itemText="nom"
      itemValue="_id"
      :fetchAutocompleteProfile="fetchAutocompleteProfile"
    />

    <profile-info
      title= 'informations inspecteur'
      v-if="profileInfo"
      :profileInfo="profileInfo"
    />
  </div>
</template>

<script>
import { FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST } from '@/store'
import AutocompleteProfile from './AutocompleteProfile'
import ProfileInfo from './ProfileInfo'
import { transformToProfileInfo } from '@/util'

const inspecteurProfileInfoDictionary = [
  [
    ['matricule', 'Matricule'],
    ['nom', 'Nom'],
    ['prenom', 'Prénom'],
    ['email', 'Email'],
    ['departement', 'Département'],
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
      fetchAutocompleteProfile: FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST,
    }
  },

  computed: {
    inspecteurs () {
      return this.$store.state.adminSearch.inspecteurs.list
    },
  },

  methods: {
    displayInspecteurInfo (inspecteur) {
      this.profileInfo = transformToProfileInfo(inspecteur, inspecteurProfileInfoDictionary)
    },
  },
}
</script>
