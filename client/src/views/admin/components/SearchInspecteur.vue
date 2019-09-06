<template>
  <div>
    <div class="u-flex u-flex--center">
    <candilib-autocomplete
      class="search-input t-search-inspecteur"
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
      <v-icon
      :color="color"
      >{{icon}}</v-icon>
    </v-btn>
    </div>
    <v-expand-transition>
      <profile-info
      title='informations inspecteur'
      v-if="displayInspecteur"
      :profileInfo="profileInfo"
      />
    </v-expand-transition>
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
      color: '#A9A9A9',
      icon: '',
      profileInfo: undefined,
      displayInspecteur: false,
      fetchAutocompleteAction: FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST,
    }
  },

  computed: mapState({
    inspecteurs: state => state.adminSearch.inspecteurs.list,
  }),

  watch: {
    inspecteur (newVal) {
      this.toggelInfo(newVal)
    },
    displayInspecteur (newVal) {
      this.toggelInfo(newVal)
    },
  },
  mounted () {
    const inspecteur = this.inspecteur
    this.toggelInfo(inspecteur)
  },

  methods: {
    displayInspecteurInfo (inspecteur) {
      this.profileInfo = transformToProfileInfo(inspecteur, inspecteurProfileInfoDictionary)
      this.displayInspecteur = true
    },
    toggleProfileInfo (inspecteur) {
      this.displayInspecteur = !this.displayInspecteur
    },
    toggelInfo (inspecteur) {
      if (!inspecteur) {
        this.color = 'grey'
        this.icon = 'keyboard_arrow_down'
        return
      }
      if (inspecteur) {
        this.color = 'green'
        this.icon = 'keyboard_arrow_up'
      }
    },
  },
}
</script>
