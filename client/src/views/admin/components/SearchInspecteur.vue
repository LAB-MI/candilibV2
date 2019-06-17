<template>
  <div>
    <candilib-autocomplete
      class="search-input"
      @selection="displayInspecteurInfo"
      label="Inspecteurs"
      hint="Chercher un inspecteur par son nom / matricule / email"
      placeholder="Dupond"
      :items="inspecteurs"
      item-text="nom"
      item-value="_id"
      :fetch-autocomplete-action="fetchAutocompleteAction"
    />
    <v-btn
        :disabled="!profileInfo"
        color="white"
        @click="toggleProfileInfo"
    > <v-icon color="grey">directions_car</v-icon>
    </v-btn>

    <profile-info
      title= 'informations inspecteur'
      v-if="profileInfo"
      :profileInfo="profileInfo"
    />
  </div>
</template>

<script>
import { FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST } from '@/store'
import CandilibAutocomplete from './CandilibAutocomplete'
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
    CandilibAutocomplete,
    ProfileInfo,
  },

  data () {
    return {
      profileInfo: undefined,
      fetchAutocompleteAction: FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST,
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
    toggleProfileInfo (inspecteur) {
      this.profileInfo = !this.profileInfo
    },
  },
}
</script>
