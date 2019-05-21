<template>
  <v-card class="elevation-0" v-if="flagModal === 'face'">
    <shedule-inspector-dialog-header
      :infoSelectedDialog="{ place: content.place, inspecteurInfos }"
      title="Ce créneau est au statut réservé"
      :closeDialog="closeDialogFace"
      colorIcon="black"
      colorButton="blue"
      icon="highlight_off"
      iconOnLeft="face"
      colorHeader="blue"
    />
    <v-divider></v-divider>
    <shedule-inspector-dialog-sub-content
      :isLoading="isLoading"
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
      :isLoading="isLoading"
      colorAlert="white"
      icon="account_box"
      colorIcon="white"
      colorSubmitButton="blue"
      textButtonCancel="Retour"
      textContent="Modifier l'inspecteur"
      :activeTextContent="displayModifyInspecteurTitle"
      :closeDialog="closeDialogFace"
      :submitDialog="changeInspecteur"
    >
    <list-search-inspecteurs-available
      slot="title"
      v-if="displaySearchInspecteurs"
      :isEditing="displaySearchInspecteurs"
      :date="content.place.date"
      :centre="centreInfo._id"
        @select-inspecteur="selectInspecteur"
    />
    <confirm-box
      v-if="hasConfirm"
      :closeAction='cancelSelection'
      :submitAction='validSelection'>
        <p>
          {{textInspecteurSeleted}}
        </p>
    </confirm-box>
    </shedule-inspector-dialog-sub-content>
  </v-card>

  <v-card v-else-if="flagModal === 'block'">
    <shedule-inspector-dialog-header
      :infoSelectedDialog="{ place: content.place, inspecteurInfos }"
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
      :isLoading="isLoading"
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
      :infoSelectedDialog="{ place: content.place, inspecteurInfos }"
      title="Ce créneau est au statut disponible"
      :closeDialog="closeDialogAndResetSelectedCandidat"
      colorIcon="black"
      colorButton="green"
      icon="highlight_off"
      iconOnLeft="check_circle"
      colorHeader="success"
    />
    <v-divider></v-divider>
    <shedule-inspector-dialog-sub-content
      :isLoading="isLoading"
      colorAlert="white"
      icon="face"
      colorIcon="white"
      colorSubmitButton="blue"
      textContent="Affecter un candidat"
      :activeTextContent="!selectedCandidat"
      :closeDialog="closeDialog"
      textButtonCancel="Retour"
      :submitDialog="displaySearchCandidatInput"
    >
      <div v-if="isCandidatEditing">
        <candilib-autocomplete
          v-if="!selectedCandidat"
          class="search-input"
          @selection="selectCandidat"
          label="Candidats"
          hint="Chercher un candidat par son nom / NEPH / email"
          placeholder="Chercher un candidat par Nom / NEPH / Email"
          :items="candidats"
          item-text="nameNeph"
          item-value="_id"
          :fetch-autocomplete-action="fetchAutocompleteAction"
        />
        <confirm-box
          v-else
          :closeAction="() => selectedCandidat = null"
          :submitAction="affectCandidatToCreneau"
        >
          <p>affecter le candidat:</p>
          <p>{{ selectedCandidat.nomNaissance }} / {{ selectedCandidat.codeNeph }}</p>
          <p>sur la place du</p>
          <p>{{ formattedDate }}</p>
        </confirm-box>
      </div>
    </shedule-inspector-dialog-sub-content>
    <v-divider></v-divider>
    <shedule-inspector-dialog-sub-content
      :isLoading="isLoading"
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
import ListSearchInspecteursAvailable from './searchInspecteur/ListSearchInspecteursAvailable.vue'
import ConfirmBox from '@/components/ConfirmBox.vue'
import CandilibAutocomplete from './CandilibAutocomplete'

import {
  getFrenchDateTimeFromIso,
} from '@/util'

import {
  ASSIGN_CANDIDAT_TO_CRENEAU,
  CREATE_CRENEAU_REQUEST,
  DELETE_BOOKED_PLACE_REQUEST,
  DELETE_PLACE_REQUEST,
  FETCH_AUTOCOMPLETE_CANDIDATS_REQUEST,
  FETCH_UPDATE_INSPECTEUR_IN_RESA_REQUEST,
} from '@/store'
import { mapGetters } from 'vuex'

export default {
  components: {
    CandilibAutocomplete,
    ConfirmBox,
    SheduleInspectorDialogHeader,
    ListSearchInspecteursAvailable,
    ConfirmBox,
    SheduleInspectorDialogSubContent,
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
  data () {
    return {
      inspecteurSelected: undefined,
      textInspecteurSeleted: undefined,
      hasConfirm: false,
      displaySearchInspecteurs: false,
      displayModifyInspecteurTitle: true,
      fetchAutocompleteAction: FETCH_AUTOCOMPLETE_CANDIDATS_REQUEST,
      isCandidatEditing: false,
      selectedCandidat: null,
    }
  },
  computed: {
    ...mapGetters(['activeDepartement']),
    isLoading () {
      return this.$store.state.admin.places.isFetching
    },
    isUpdatingInspecteur () {
      return this.$store.state.adminModifInspecteur.isUpdating
    },
    candidats () {
      return this.$store.state.adminSearch.candidats.list.map(candidat => {
        const { nomNaissance, codeNeph } = candidat
        const nameNeph = nomNaissance + ' | ' + codeNeph
        return { nameNeph, ...candidat }
      })
    },

    inspecteurInfos () {
      return this.$store.state.admin.inspecteurs.list
        .find(inspecteur => inspecteur._id === this.inspecteurId)
    },

    formattedDate () {
      return getFrenchDateTimeFromIso(this.content.place.date)
    },
  },

  methods: {
    selectInspecteur (inspecteur) {
      this.inspecteurSelected = inspecteur
      this.textInspecteurSeleted = `Vous avez choisi l'inspecteur ${inspecteur.nom}, ${inspecteur.matricule}`
      this.hasConfirm = true
      this.displaySearchInspecteurs = false
      this.displayModifyInspecteurTitle = false
    },

    selectCandidat (candidat) {
      this.selectedCandidat = candidat
    },

    closeDialogAndResetSelectedCandidat () {
      this.isCandidatEditing = false
      this.selectedCandidat = null
      this.closeDialog()
    },

    displaySearchCandidatInput () {
      this.isCandidatEditing = !this.isCandidatEditing
    },

    async affectCandidatToCreneau () {
      await this.$store
        .dispatch(ASSIGN_CANDIDAT_TO_CRENEAU, {
          placeId: this.content.place._id,
          candidatId: this.selectedCandidat._id,
        })
      this.updateContent()
      this.closeDialogAndResetSelectedCandidat()
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
      this.displaySearchInspecteurs = true
    },

    closeDialogInspecteur () {
      this.displayModifyInspecteurTitle = true
      this.displaySearchInspecteurs = false
      this.textInspecteurSeleted = undefined
      this.inspecteurSelected = undefined
      this.hasConfirm = false
    },
    async closeDialogFace () {
      this.closeDialogInspecteur()
      this.closeDialog()
    },

    cancelSelection () {
      this.displaySearchInspecteurs = true
      this.displayModifyInspecteurTitle = true
      this.textInspecteurSeleted = undefined
      this.inspecteurSelected = undefined
      this.hasConfirm = false
    },
    async validSelection () {
      const resa = this.content.place._id
      const inspecteur = this.inspecteurSelected._id
      const departement = this.activeDepartement
      await this.$store.dispatch(FETCH_UPDATE_INSPECTEUR_IN_RESA_REQUEST, { departement, resa, inspecteur })
      this.updateContent()
      this.closeDialogFace()
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
