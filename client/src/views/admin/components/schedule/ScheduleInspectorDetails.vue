<template>
  <v-card
    v-if="isBooked"
    class="details"
  >
    <place-action-header
      v-if="content.place && content.place.candidat"
      :candidat="candidat"
    />
    <place-action
      :is-loading="isLoading"
      icon="block"
      color-icon="white"
      color-submit-button="grey"
      text-content="Annuler réservation"
      :active-text-content="!deleteBookedPlaceConfirm"
      text-button-cancel="Retour"
      :content="content"
      @click="displayConfirmDeleteBookedPlace"
    >
      <confirm-box
        v-if="deleteBookedPlaceConfirm"
        :close-action="cancelDeleteBookedPlace"
        :submit-action="deleteBookedPlace"
        ok-button-text="Supprimer réservation"
        ok-button-color="warning"
      >
        <!-- TODO: Refactor Create composant for each subcontent dialogs -->
        <div v-if="isFetchingCandidat">
          {{ $formatMessage({ id: 'loading'}) }}...
        </div>
        <div v-else>
          <p>
            {{ $formatMessage({ id: 'nom'}) }}:
            <strong>
              {{ candidat.nomNaissance }}
            </strong>
            /
            {{ $formatMessage({ id: 'neph'}) }}:
            <strong>
              {{ candidat.codeNeph }}
            </strong>
          </p>
          <p>
            {{ candidat.email }}
          </p>
          <p>
            {{ $formatMessage({ id: 'mobile'}) }}:
            <strong>
              {{ candidat.portable }}
            </strong>
          </p>
        </div>
      </confirm-box>
    </place-action>
    <place-action
      :is-loading="isLoading"
      color-alert="white"
      icon="account_box"
      color-icon="white"
      color-submit-button="blue"
      text-button-cancel="Retour"
      text-content="Modifier l'inspecteur"
      :active-text-content="displayModifyInspecteurTitle"
      @click="toggleInspecteurSearch"
    >
      <list-search-inspecteurs-available
        v-if="displaySearchInspecteurs"
        slot="title"
        :is-editing="displaySearchInspecteurs"
        :date="content.place.date"
        :centre="centreInfo._id"
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
    </place-action>
  </v-card>

  <v-card
    v-else-if="!isAvailable"
    class="details"
  >
    <place-action
      :is-loading="isLoading"
      color-alert="white"
      icon="check_circle"
      color-icon="white"
      color-submit-button="green"
      text-content="Rendre le créneau disponible"
      text-button-cancel="Retour"
      @click="setCreneauAvailable"
    />
  </v-card>

  <v-card
    v-else-if="isAvailable"
    class="details"
  >
    <place-action
      :is-loading="isLoading"
      color-alert="white"
      icon="face"
      color-icon="white"
      color-submit-button="blue"
      text-content="Affecter un candidat"
      :active-text-content="!selectedCandidat"
      text-button-cancel="Retour"
      @click="displaySearchCandidatInput"
    >
      <div v-if="isCandidatEditing">
        <candilib-autocomplete
          v-if="!selectedCandidat"
          class="search-input"
          label="Candidats"
          hint="Chercher un candidat par son nom / NEPH / email"
          placeholder="Chercher un candidat par Nom / NEPH / Email"
          :items="candidats"
          item-text="nameNeph"
          item-value="_id"
          :fetch-autocomplete-action="fetchAutocompleteAction"
          @selection="selectCandidat"
        />
        <confirm-box
          v-else
          :close-action="() => selectedCandidat = null"
          :submit-action="affectCandidatToCreneau"
          :aria-disabled="isLoading"
          :disabled="isLoading"
        >
          <p>
            {{ $formatMessage({ id: 'affecter_le_candidat'}) }}:
            <strong>
              {{ selectedCandidat.nomNaissance }} / {{ selectedCandidat.codeNeph }}
            </strong>
          </p>
          <p>
            {{ $formatMessage({ id: 'sur_la_place_du'}) }}
            <strong>
              {{ formattedDate }}
            </strong>
          </p>
          <p>
            {{ $formatMessage({ id: 'au_centre'}) }}
            <strong>
              {{ centerName }}
            </strong>
          </p>
        </confirm-box>
      </div>
    </place-action>
    <place-action
      :is-loading="isLoading"
      color-alert="white"
      icon="block"
      color-icon="white"
      color-submit-button="grey"
      text-content="Rendre indisponible"
      text-button-cancel="Retour"
      @click="setCreneauUnavalaible"
    />
  </v-card>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import PlaceAction from './PlaceAction.vue'
import PlaceActionHeader from './PlaceActionHeader.vue'
import ListSearchInspecteursAvailable from '../searchInspecteur/ListSearchInspecteursAvailable.vue'
import ConfirmBox from '@/components/ConfirmBox.vue'
import CandilibAutocomplete from '../CandilibAutocomplete'

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
    place: {
      type: Object,
      default () {},
    },
    centreInfo: {
      type: Object,
      default () {},
    },
    closeDialog: {
      type: Function,
      default () {},
    },
    content: {
      type: Object,
      default () {},
    },
    flagModal: {
      type: String,
      default: '',
    },
    inspecteurId: {
      type: String,
      default: '',
    },
    selectedDate: {
      type: String,
      default: '',
    },
    updateContent: {
      type: Function,
      default () {},
    },
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
        const {
          places,
          inspecteurs,
        } = state.admin
        return places.isFetching ||
          inspecteurs.isFetching ||
          places.isDeletingBookedPlace ||
          places.isDeletingAvailablePlace ||
          places.isCreating
      },

      isUpdatingInspecteur (state) {
        return state.adminModifInspecteur.isUpdating
      },

      candidat (state) {
        return state.candidats.candidat
      },

      candidats (state) {
        return state.adminSearch.candidats.list
          .filter(candidat => candidat.isValidatedByAurige)
          .map(candidat => {
            const { nomNaissance, codeNeph } = candidat
            const nameNeph = nomNaissance + ' | ' + codeNeph
            return { nameNeph, ...candidat }
          })
      },

      isFetchingCandidat (state) {
        return state.candidats.isFetching
      },

      inspecteurInfos (state) {
        return state.admin.inspecteurs.list
          .find(inspecteur => inspecteur._id === this.inspecteurId)
      },

      centerName (state) {
        const centre = state.center.selected
        return centre && centre.nom
      },
    }),

    isAvailable () {
      return !!this.place && !('candidat' in this.place)
    },

    isBooked () {
      return !!this.place && 'candidat' in this.place
    },

    formattedDate () {
      return getFrenchDateTimeFromIso(this.content.place.date)
    },

  },

  methods: {
    toggleInspecteurSearch () {
      this.deleteBookedPlaceConfirm = false
      this.displaySearchInspecteurs = !this.displaySearchInspecteurs
    },

    selectInspecteur (inspecteur) {
      this.inspecteurSelected = inspecteur
      this.textInspecteurSelected = `Vous avez choisi l'inspecteur ${inspecteur.prenom}, ${inspecteur.nom}, ${inspecteur.matricule}`
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
      this.displaySearchInspecteurs = false
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
