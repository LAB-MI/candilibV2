<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    hide-overlay
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        class="t-import-places"
        color="primary"
        dark
        v-bind="attrs"
        v-on="on"
      >
        Import Places
      </v-btn>
    </template>
    <v-card>
      <v-toolbar
        color="#1E1E1E"
      >
        <v-toolbar-title>
          <v-chip
            color="white"
            outlined
          >
            <strong class="text-2xl">
              Planifier les inspecteurs
            </strong>
          </v-chip>
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          class="mr-1 t-close-btn-import-places"
          color="white"
          outlined
          icon
          @click="dialog = false"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card class="ma-2 pa-2">
        <div class="flex flex-wrap align-center justify-center">
          <v-card-title>
            Planifier un seul inspecteur pour le Centre&nbsp;
            <strong>{{ activeCentreInfos.nom }}</strong>&nbsp;
            du département&nbsp;
            <strong>{{ activeDepartement }}</strong>&nbsp;
            le &nbsp;
            <strong>
              {{ formatedSelectedDate }}
            </strong>&nbsp;:
          </v-card-title>
          <candilib-autocomplete
            class="flex-1 col-8 t-modal-input-places-search-inspecteur"
            label="Inspecteurs"
            hint="Chercher un inspecteur par son nom / matricule / email"
            placeholder="Dupond"
            :items="inspecteursFullList"
            item-text="nomPrenomMatricule"
            item-value="_id"
            :fetch-autocomplete-action="fetchAutocompleteAction"
            @selection="displayInspecteurInfo"
          />
        </div>

        <div :class="`${isIpcsrHasSelected ? '' : 'opacity-75'}`">
          <div class="pa-5 flex flex-wrap align-center justify-center">
            <v-btn
              class="t-import-places-modal-btn-all"
              :disabled="!isIpcsrHasSelected"
              :outlined="isSelectAllSlots ? false : true"
              :color="isSelectAllSlots ? 'primary' : colorDisabledButton"
              @click="selectAllSlots()"
            >
              Tout sélectionner
            </v-btn>
            <v-btn
              class="t-import-places-modal-btn-morning"
              :disabled="!isIpcsrHasSelected"
              :outlined="isSelectAllMorningSlots ? false : true"
              :color="isSelectAllMorningSlots ? 'primary' : colorDisabledButton"
              @click="selectAllMorningSlots()"
            >
              Sélectionner le matin
            </v-btn>
            <v-btn
              class="t-import-places-modal-btn-afternoon"
              :disabled="!isIpcsrHasSelected"
              :outlined="isSelectAllAfternoonSlots ? false : true"
              :color="isSelectAllAfternoonSlots ? 'primary' : colorDisabledButton"
              @click="selectAllAfternoonSlots()"
            >
              Sélectionner l'après-midi
            </v-btn>
          </div>

          <div class="flex flex-wrap align-center justify-center t-import-places-modal-checkbox-content">
            <v-checkbox
              v-for="(creneau, index) in creneauMorningAfternoonSetting.morning"
              :key="creneau"
              v-model="selectedCreneauForIPCSR"
              :label="creneau"
              :value="creneau"
              color="primary"
              :class="`check-box-style t-import-places-modal-checkbox-morning-${index}`"
              :disabled="!isIpcsrHasSelected"
            >
              {{ creneau }}
            </v-checkbox>
            <v-checkbox
              v-for="(creneau, index) in creneauMorningAfternoonSetting.afternoon"
              :key="creneau"
              v-model="selectedCreneauForIPCSR"
              :label="creneau"
              :value="creneau"
              color="primary"
              :class="`check-box-style t-import-places-modal-checkbox-afternoon-${index}`"
              :disabled="!isIpcsrHasSelected"
            >
              {{ creneau }}
            </v-checkbox>
          </div>
        </div>

        <div
          :class="`flex flex-wrap align-center justify-center pa-6 ${isIpcsrHasSelected ? '' : 'opacity-75'}`"
        >
          <v-btn
            :disabled="!isIpcsrHasSelected"
            rounded
            class="flex-1 col-2"
            color="error"
            outlined
            @click="dialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            :disabled="!isIpcsrHasSelected || !selectedCreneauForIPCSR.length"
            rounded
            class="flex-1 col-2 t-import-places-modal-confirm-btn"
            color="primary"
            @click="addPlacesForOneIPCSR()"
          >
            Confirmer
          </v-btn>
        </div>
      </v-card>

      <v-card class="ma-2">
        <v-card-title class="flex flex-wrap align-center justify-center">
          <span>
            Importation des places:
          </span>
        </v-card-title>
        <div class="u-pr">
          <big-loading-indicator :is-loading="isPlacesUpdating" />
          <v-layout
            wrap
            class="u-flex--space-between  u-pr"
          >
            <admin-import-places class="import-places" />
            <import-places-validation class="u-flex__item" />
          </v-layout>
        </div>
      </v-card>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { CREATE_PLACES_REQUEST, FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST } from '@/store'
import { creneauMorningAfternoonSetting, getFrenchLuxonFromSql } from '../../../../util'
import CandilibAutocomplete from '../CandilibAutocomplete'
import AdminImportPlaces from '../AdminImportPlaces'
import ImportPlacesValidation from '../ImportPlacesValidation'
import { BigLoadingIndicator } from '@/components'

export default {
  components: {
    CandilibAutocomplete,
    AdminImportPlaces,
    ImportPlacesValidation,
    BigLoadingIndicator,
  },
  props: {
    activeCentreInfos: {
      type: Object,
      default: () => {},
    },
    selectedDate: {
      type: String,
      default: '',
    },
    reloadWeekMonitor: {
      type: Function,
      default: () => {},
    },
  },
  data () {
    return {
      colorDisabledButton: '#1E1E1E',
      dialog: false,
      notifications: false,
      sound: true,
      widgets: false,
      fetchAutocompleteAction: FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST,
      selectedCreneauForIPCSR: [],
      isImportPlacesActive: false,
      isSelectAllSlots: false,
      isSelectAllMorningSlots: false,
      isSelectAllAfternoonSlots: false,
      currentSelectedInspecteur: { inspecteurInfos: {}, places: [] },
      isIpcsrHasSelected: false,

    }
  },
  computed: {
    ...mapGetters(['activeDepartement']),
    ...mapState({
      isPlacesUpdating: state => state.importPlaces.isPlacesUpdating,

      isFetching (state) {
        const {
          places,
          inspecteurs,
        } = state.admin
        return places.isFetching ||
          inspecteurs.isFetching ||
          places.isDeletingBookedPlace ||
          places.isDeletingAvailablePlace ||
          places.isCreating || state.adminSearch.isFetching
      },

      inspecteursFullList (state) {
        return state.adminSearch.inspecteurs.list.map(inspecteur => {
          const { nom, prenom, matricule } = inspecteur
          const nomPrenomMatricule = nom + '  ' + prenom + ' | ' + matricule
          return { nomPrenomMatricule, ...inspecteur }
        })
      },
    }),

    beginDate () {
      return getFrenchLuxonFromSql(this.selectedDate).startOf('day').toISO()
    },

    endDate () {
      return getFrenchLuxonFromSql(this.selectedDate).endOf('day').toISO()
    },

    formatedSelectedDate () {
      return this.selectedDate.split('-').reverse().join('/')
    },
  },

  beforeMount () {
    this.creneauMorningAfternoonSetting = creneauMorningAfternoonSetting
  },

  methods: {
    displayInspecteurInfo (inspecteur) {
      this.isIpcsrHasSelected = !!inspecteur
      this.currentSelectedInspecteur.inspecteurInfos = inspecteur
    },
    selectAllSlots () {
      const { morning, afternoon } = this.creneauMorningAfternoonSetting
      this.isSelectAllSlots = !this.isSelectAllSlots
      this.isSelectAllMorningSlots = false
      this.isSelectAllAfternoonSlots = false

      this.selectedCreneauForIPCSR = this.isSelectAllSlots ? [...morning, ...afternoon] : []
    },

    selectAllMorningSlots () {
      const { morning } = this.creneauMorningAfternoonSetting

      this.isSelectAllMorningSlots = !this.isSelectAllMorningSlots
      this.isSelectAllAfternoonSlots = false
      this.isSelectAllSlots = false
      this.selectedCreneauForIPCSR = this.isSelectAllMorningSlots ? morning : []
    },

    selectAllAfternoonSlots () {
      const { afternoon } = this.creneauMorningAfternoonSetting

      this.isSelectAllAfternoonSlots = !this.isSelectAllAfternoonSlots
      this.isSelectAllMorningSlots = false
      this.isSelectAllSlots = false
      this.selectedCreneauForIPCSR = this.isSelectAllAfternoonSlots ? afternoon : []
    },

    async addPlacesForOneIPCSR () {
      this.currentSelectedInspecteur.places = this.selectedCreneauForIPCSR

      const inspecteurPlacesSelection = {
        centre: this.activeCentreInfos,
        inspecteur: this.currentSelectedInspecteur.inspecteurInfos._id,
        dates: this.currentSelectedInspecteur.places.map(crenau => {
          const [year, month, day] = this.selectedDate.split('-')
          const formatedDate = `${day}/${month}/${year} ${crenau.replace('h', ':')}`
          return formatedDate
        }),
      }

      await this.$store.dispatch(CREATE_PLACES_REQUEST, inspecteurPlacesSelection)
      this.resetFormPlaceForOneIPCSR()
      this.dialog = false
      this.$emit('reload-week-monitor')
    },

    resetFormPlaceForOneIPCSR () {
      this.currentSelectedInspecteur = { inspecteurInfos: this.currentSelectedInspecteur.inspecteurInfos, places: [] }
      this.selectedCreneauForIPCSR = []
      this.isSelectAllMorningSlots = false
      this.isSelectAllAfternoonSlots = false
      this.isSelectAllSlots = false
    },
  },
}
</script>

<style lang="postcss" scoped>
>>> .check-box-style {
  margin: 0.4em;

  & .v-input__slot {
    display: flex;
    flex-direction: column;

    & > div {
      order: 2;
    }

    & label {
      order: 1;
    }
  }
}
</style>
