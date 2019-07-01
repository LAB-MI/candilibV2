<template>
  <v-card class="details" v-if="isBooked">
    <place-action-header
      v-if="content.place && content.place.candidat"
      :candidat="candidat"
    />
    <place-action
      :isLoading="isLoading"
      icon="block"
      colorIcon="white"
      colorSubmitButton="grey"
      textContent="Annuler réservation"
      :activeTextContent="!deleteBookedPlaceConfirm"
      textButtonCancel="Retour"
      @click="displayConfirmDeleteBookedPlace"
      :content="content"
    >
      <confirm-box
        v-if="deleteBookedPlaceConfirm"
        :closeAction='cancelDeleteBookedPlace'
        :submitAction='deleteBookedPlace'
      >
      <!-- TODO: Refactor Create composant for each subcontent dialogs -->
        <div v-if="isFetchingCandidat">
          Chargement en cours...
        </div>
        <div v-else>
          <p>
            Nom:
            <strong>
              {{ candidat.nomNaissance }}
            </strong>
            /
            Neph:
            <strong>
              {{ candidat.codeNeph }}
            </strong>
          </p>
          <p>
            {{ candidat.email }}
          </p>
          <p>
            Portable:
            <strong>
              {{ candidat.portable }}
            </strong>
          </p>
        </div>
      </confirm-box>
    </place-action>
    <place-action
      :isLoading="isLoading"
      colorAlert="white"
      icon="account_box"
      colorIcon="white"
      colorSubmitButton="blue"
      textButtonCancel="Retour"
      textContent="Modifier l'inspecteur"
      @click="toggleInspecteurSearch"
      :activeTextContent="displayModifyInspecteurTitle"
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
        :submitAction='validSelection'
      >
        <p>
          {{textInspecteurSelected}}
        </p>
      </confirm-box>
    </place-action>
  </v-card>

  <v-card class="details" v-else-if="!isAvailable">
    <place-action
      :isLoading="isLoading"
      colorAlert="white"
      icon="check_circle"
      colorIcon="white"
      colorSubmitButton="green"
      textContent="Rendre le créneau disponible"
      textButtonCancel="Retour"
      @click="setCreneauAvailable"
    />
  </v-card>

  <v-card class="details" v-else-if="isAvailable">
    <place-action
      :isLoading="isLoading"
      colorAlert="white"
      icon="face"
      colorIcon="white"
      colorSubmitButton="blue"
      textContent="Affecter un candidat"
      :activeTextContent="!selectedCandidat"
      textButtonCancel="Retour"
      @click="displaySearchCandidatInput"
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
          <p>
            Affecter le candidat:
            <strong>
              {{ selectedCandidat.nomNaissance }} / {{ selectedCandidat.codeNeph }}
            </strong>
          </p>
          <p>
            sur la place du
            <strong>
              {{ formattedDate }}
            </strong>
          </p>
          <p>
            au centre
            <strong>
              {{ centerName }}
            </strong>
          </p>
        </confirm-box>
      </div>
    </place-action>
    <place-action
      :isLoading="isLoading"
      colorAlert="white"
      icon="block"
      colorIcon="white"
      colorSubmitButton="grey"
      textContent="Rendre indisponible"
      textButtonCancel="Retour"
      @click="setCreneauUnavalaible"
    />
  </v-card>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import PlaceAction from './PlaceAction.vue'
import PlaceActionHeader from './PlaceActionHeader.vue'
import ListSearchInspecteursAvailable from './searchInspecteur/ListSearchInspecteursAvailable.vue'
import ConfirmBox from '@/components/ConfirmBox.vue'
import CandilibAutocomplete from './CandilibAutocomplete'

import {
  getFrenchDateTimeFromIso,
} from '@/util'

import {
  ASSIGN_CANDIDAT_TO_CRENEAU,
  CREATE_PLACE_REQUEST,
  DELETE_BOOKED_PLACE_REQUEST,
  DELETE_PLACE_REQUEST,
  FETCH_AUTOCOMPLETE_CANDIDATS_REQUEST,
  FETCH_UPDATE_INSPECTEUR_IN_RESA_REQUEST,
} from '@/store'

export default {
  components: {
    CandilibAutocomplete,
    ConfirmBox,
    PlaceActionHeader,
    ListSearchInspecteursAvailable,
    PlaceAction,
  },

  props: {
    place: Object,
    centreInfo: Object,
    closeDialog: Function,
    content: Object,
    flagModal: String,
    inspecteurId: String,
    selectedDate: String,
    updateContent: Function,
  },

  data () {
    return {
      inspecteurSelected: undefined,
      textInspecteurSelected: undefined,
      hasConfirm: false,
      displaySearchInspecteurs: false,
      displayModifyInspecteurTitle: true,
      fetchAutocompleteAction: FETCH_AUTOCOMPLETE_CANDIDATS_REQUEST,
      isCandidatEditing: false,
      selectedCandidat: null,
      deleteBookedPlaceConfirm: false,
    }
  },

  computed: {
    ...mapGetters(['activeDepartement']),

    ...mapState({
      isLoading (state) {
        return state.admin.places.isFetching
      },

      isUpdatingInspecteur (state) {
        return state.adminModifInspecteur.isUpdating
      },

      candidat (state) {
        return state.candidats.candidat
      },

      isFetchingCandidat (state) {
        return state.candidats.isFetching
      },
    }),

    candidats () {
      return this.$store.state.adminSearch.candidats.list
        .filter(candidat => candidat.isValidatedByAurige)
        .map(candidat => {
          const { nomNaissance, codeNeph } = candidat
          const nameNeph = nomNaissance + ' | ' + codeNeph
          return { nameNeph, ...candidat }
        })
    },

    inspecteurInfos () {
      return this.$store.state.admin.inspecteurs.list
        .find(inspecteur => inspecteur._id === this.inspecteurId)
    },

    isAvailable () {
      return !!this.place && !('candidat' in this.place)
    },

    isBooked () {
      return !!this.place && 'candidat' in this.place
    },

    formattedDate () {
      return getFrenchDateTimeFromIso(this.content.place.date)
    },

    centerName () {
      const centre = this.$store.state.center.selected
      return centre && centre.nom
    },
  },

  methods: {
    toggleInspecteurSearch () {
      this.displaySearchInspecteurs = !this.displaySearchInspecteurs
    },

    selectInspecteur (inspecteur) {
      this.inspecteurSelected = inspecteur
      this.textInspecteurSelected = `Vous avez choisi l'inspecteur ${inspecteur.nom}, ${inspecteur.matricule}`
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

    async displayConfirmDeleteBookedPlace () {
      this.deleteBookedPlaceConfirm = !this.deleteBookedPlaceConfirm
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

    async setCreneauUnavalaible () {
      await this.$store.dispatch(DELETE_PLACE_REQUEST, this.content.place._id)
      this.updateContent()
      this.closeDialog()
    },

    async deleteBookedPlace () {
      await this.$store
        .dispatch(DELETE_BOOKED_PLACE_REQUEST, this.content.place._id)
      this.updateContent()
      this.closeDialog()
    },

    closeDialogInspecteur () {
      this.displayModifyInspecteurTitle = true
      this.displaySearchInspecteurs = false
      this.textInspecteurSeleted = undefined
      this.inspecteurSelected = undefined
      this.hasConfirm = false
      this.deleteBookedPlaceConfirm = false
    },

    async closeDialogFace () {
      this.closeDialogInspecteur()
      this.closeDialog()
    },

    cancelSelection () {
      this.displaySearchInspecteurs = true
      this.displayModifyInspecteurTitle = true
      this.textInspecteurSelected = undefined
      this.inspecteurSelected = undefined
      this.hasConfirm = false
    },

    cancelDeleteBookedPlace () {
      this.deleteBookedPlaceConfirm = false
    },

    async validSelection () {
      const resa = this.content.place._id
      const inspecteur = this.inspecteurSelected._id
      const departement = this.activeDepartement
      await this.$store.dispatch(FETCH_UPDATE_INSPECTEUR_IN_RESA_REQUEST, { departement, resa, inspecteur })
      this.updateContent()
      this.closeDialogFace()
    },

    async setCreneauAvailable () {
      const [year, month, day] = this.selectedDate.split('-')
      const date = `${day}/${month}/${year} ${this.content.hour.replace('h', ':')}`
      const inspecteur = this.inspecteurId
      const centre = this.centreInfo
      await this.$store
        .dispatch(CREATE_PLACE_REQUEST, { date, centre, inspecteur })
      this.updateContent()
      this.closeDialog()
    },
  },
}
</script>

<style lang="stylus" scoped>
.details {
  padding: 1em;
  margin: 1em;
}
</style>
