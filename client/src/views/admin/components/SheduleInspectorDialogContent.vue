<template>
  <v-card class="elevation-0" v-if="flagModal === 'face'">
    <shedule-inspector-dialog-header
      title="Ce créneau est au statut réservé"
      :closeDialog="closeDialog"
      colorIcon="black"
      colorButton="blue"
      icon="highlight_off"
      iconOnLeft="face"
      colorHeader="blue"
    />
    <v-divider></v-divider>
    <shedule-inspector-dialog-sub-content
      colorAlert="white"
      icon="block"
      colorIcon="white"
      colorSubmitButton="grey"
      textContent="Annuler reservation"
      textButtonCancel="Retour"
      :closeDialog="closeDialog"
      :submitDialog="renderCreneauUnBookAndUnavalaible"
      :content="content"
    />
    <shedule-inspector-dialog-sub-content
      colorAlert="white"
      icon="account_box"
      colorIcon="white"
      colorSubmitButton="blue"
      textContent="Modifier l'IPCSR"
      textButtonCancel="Retour"
      :closeDialog="closeDialog"
      :submitDialog="changeInspecteur"
    />
  </v-card>
  <v-card v-else-if="flagModal === 'block'">
    <shedule-inspector-dialog-header
      title="Ce créneau est au statut indisponible"
      :closeDialog="closeDialog"
      colorIcon="black"
      colorButton="grey"
      icon="highlight_off"
      iconOnLeft="block"
      colorHeader="grey"
    />
    <v-divider></v-divider>
    <shedule-inspector-dialog-sub-content
      colorAlert="white"
      icon="check_circle"
      colorIcon="white"
      colorSubmitButton="green"
      textContent="Rendre le créneau disponible"
      textButtonCancel="Retour"
      :closeDialog="closeDialog"
      :submitDialog="makeCreneauAvailable"
    />
  </v-card>
  <v-card v-else-if="flagModal === 'check'">
    <shedule-inspector-dialog-header
      title="Ce créneau est au statut disponible"
      :closeDialog="closeDialog"
      colorIcon="black"
      colorButton="green"
      icon="highlight_off"
      iconOnLeft="check_circle"
      colorHeader="success"
    />
    <v-divider></v-divider>
    <shedule-inspector-dialog-sub-content
      colorAlert="white"
      icon="face"
      colorIcon="white"
      colorSubmitButton="blue"
      textContent="Affecter un candidat"
      :closeDialog="closeDialog"
      textButtonCancel="Retour"
      :submitDialog="affectCandidatToCreneau"
    />
    <v-divider></v-divider>
    <shedule-inspector-dialog-sub-content
      colorAlert="white"
      icon="block"
      colorIcon="white"
      colorSubmitButton="grey"
      textContent="Rendre indisponible"
      textButtonCancel="Retour"
      :closeDialog="closeDialog"
      :submitDialog="renderCreneauUnavalaible"
    />
  </v-card>
</template>

<script>
import SheduleInspectorDialogSubContent from './SheduleInspectorDialogSubContent.vue'
import SheduleInspectorDialogHeader from './SheduleInspectorDialogHeader.vue'

import {
  CREATE_CRENEAU_REQUEST,
  DELETE_PLACE_REQUEST,
  DELETE_BOOKED_PLACE_REQUEST,
} from '@/store'

export default {
  components: {
    SheduleInspectorDialogSubContent,
    SheduleInspectorDialogHeader,
  },
  props: {
    flagModal: String,
    content: Object,
    closeDialog: Function,
    icon: String,
    selectedDate: String,
    updateContent: Function,
    inspecteurId: String,
    centreInfo: Object,
  },
  methods: {
    affectCandidatToCreneau () {
      this.closeDialog()
    },

    async renderCreneauUnavalaible () {
      await this.$store.dispatch(DELETE_PLACE_REQUEST, this.content.place._id)
      this.updateContent()
      this.closeDialog()
    },

    async renderCreneauUnBookAndUnavalaible () {
      await this.$store
        .dispatch(DELETE_BOOKED_PLACE_REQUEST, this.content.place._id)
      this.updateContent()
      this.closeDialog()
    },

    changeInspecteur () {
      this.closeDialog()
    },

    async makeCreneauAvailable () {
      const [year, month, day] = this.selectedDate.split('-')
      const date = `${day}/${month}/${year} ${this.content.hour.replace('h', ':')}`
      const inspecteur = this.inspecteurId
      const centre = this.centreInfo
      await this.$store
        .dispatch(CREATE_CRENEAU_REQUEST, { date, centre, inspecteur })
      this.updateContent()
      this.closeDialog()
    },
  },
}
</script>
