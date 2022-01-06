<template>
  <v-card class="m-3 p-6 pt-1">
    <v-card-title>
      Permuter l'inspecteur avec ?
    </v-card-title>
    <v-card-actions class="flex flex-wrap">
      <list-search-inspecteurs-available
        v-if="isEditing"
        slot="title"
        :is-editing="isEditing"
        :inspecteurs-data="inspecteursData"
        :inspecteur-id="inspecteurId"
        :centre="centreId"
        @select-inspecteur="selectInspecteur"
      />
      <confirm-box
        v-if="hasConfirm"
        :close-action="cancelSelection"
        :submit-action="validSelection"
        class="t-inspecteur-confirm-box"
      >
        <p
          class="t-inspecteur-detail"
        >
          {{ textInspecteurSelected }}
        </p>
      </confirm-box>
    </v-card-actions>
  </v-card>
</template>

<script>
import ListSearchInspecteursAvailable from '../searchInspecteur/ListSearchInspecteursAvailable'
import ConfirmBox from '@/components/ConfirmBox.vue'
import { FETCH_UPDATE_INSPECTEUR_IN_RESA_REQUEST } from '@/store'

export default {
  components: {
    ListSearchInspecteursAvailable,
    ConfirmBox,
  },
  props: {
    centreId: {
      type: String,
      default: '',
    },
    inspecteurId: {
      type: String,
      default: '',
    },
    inspecteursData: {
      type: Array,
      default: () => [],
    },
    activeDepartement: {
      type: String,
      default: undefined,
    },
    isEditing: Boolean,
    updateContent: {
      type: Function,
      default () {},
    },
    closeDialog: {
      type: Function,
      default () {},
    },
  },
  data () {
    return {
      hasConfirm: false,
      textInspecteurSelected: '',
      inspecteurSelected: undefined,
    }
  },
  methods: {

    cancelSelection () {
      this.hasConfirm = false
      this.inspecteurSelected = undefined
      this.textInspecteurSelected = undefined
      this.inspecteurInfo = this.inspecteursData
    },

    async validSelection () {
      const resa = (this.inspecteursData.find(inspecteur => inspecteur._id === this.inspecteurId))?.creneau.filter(slot => !!slot.place?.candidat).map(item => item.place)
      const inspecteur = this.inspecteurSelected
      const departement = this.activeDepartement
      await this.$store.dispatch(FETCH_UPDATE_INSPECTEUR_IN_RESA_REQUEST, { departement, resa, inspecteur })
      this.updateContent()
      this.closeDialog()
    },

    selectInspecteur (inspecteur) {
      this.inspecteurSelected = inspecteur
      this.textInspecteurSelected = `Vous avez choisi l'inspecteur ${inspecteur.prenom}, ${inspecteur.nom}, ${inspecteur.matricule}`
      this.hasConfirm = true
    },
  },
}
</script>
