<template>
  <div>
    <div class="u-flex u-flex--center">
      <candilib-autocomplete
        class="search-input t-search-inspecteur"
        label="Inspecteurs"
        hint="Chercher un inspecteur par son nom / matricule / email"
        placeholder="Dupond"
        :items="inspecteurs"
        item-text="nomPrenomMatricule"
        item-value="_id"
        :fetch-autocomplete-action="fetchAutocompleteAction"
        @selection="displayInspecteurInfo"
      />
      <v-btn
        icon
        :disabled="!profileInfo"
        color="white"
        @click="toggleProfileInfo"
      >
        <v-icon
          :color="color"
        >
          {{ icon }}
        </v-icon>
      </v-btn>
    </div>
    <v-expand-transition>
      <profile-info
        v-if="displayInspecteur"
        class="t-result-inspecteur"
        title="informations inspecteur"
        :profile-info="profileInfo"
      />
    </v-expand-transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import { FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST } from '@/store'
import CandilibAutocomplete from './CandilibAutocomplete'
import ProfileInfo from './ProfileInfo'
import { transformToProfileInfo, inspecteurProfileInfoDictionary } from '@/util'

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
    inspecteur: state => state.adminSearch.inspecteurs.list,
    inspecteurs: state => state.adminSearch.inspecteurs.list
      .map(inspecteur => {
        const { nom, prenom, matricule } = inspecteur
        const nomPrenomMatricule = nom + '  ' + prenom + ' | ' + matricule
        return { nomPrenomMatricule, ...inspecteur }
      }),
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
