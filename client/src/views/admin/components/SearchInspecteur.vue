<template>
  <div>
    <div class="u-flex u-flex--center">
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
      icon
      :disabled="!profileInfo"
      color="white"
      @click="toggleProfileInfo"
    >
      <v-icon color="green">directions_car</v-icon>
    </v-btn>
    </div>
    <profile-info
      title='informations inspecteur'
      v-if="displayInspecteur"
      :profileInfo="profileInfo"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'

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
      displayInspecteur: false,
      fetchAutocompleteAction: FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST,
    }
  },

  computed: mapState({
    inspecteurs: state => state.adminSearch.inspecteurs.list,
  }),

  methods: {
    displayInspecteurInfo (inspecteur) {
      this.profileInfo = transformToProfileInfo(inspecteur, inspecteurProfileInfoDictionary)
      this.displayInspecteur = true
    },
    toggleProfileInfo (inspecteur) {
      this.displayInspecteur = !this.displayInspecteur
    },
  },
}
</script>
