<template>
  <div>
    <div class="u-flex u-flex--center">
      <candilib-autocomplete
        class="search-input  t-input-search-candidat-inspecteur"
        label="Inspecteurs"
        hint="Chercher un inspecteur par son nom / matricule / email"
        placeholder="Dupond"
        :items="matchingInspecteurs"
        item-text="text"
        item-value="_id"
        :fetch-autocomplete-action="fetchAutocompleteAction"
        @selection="ipcsrSelect"
      />
    </div>
    <div class="t-date-input u-flex u-flex--center">
      <v-menu
        v-model="menuDate"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        readonly
        max-width="290px"
        min-width="290px"
      >
        <template #activator="{ on }">
          <v-text-field
            v-model="pickerDateExmen"
            label="Date de l'examen"
            prepend-icon="event"
            readonly
            v-on="on"
          />
        </template>

        <v-date-picker
          v-model="dateExam"
          locale="fr"
          @input="menuDate = false"
        />
      </v-menu>
    </div>

    <time-slot-candidats
      v-show="examsPlaces.length"
      :creneau-candidats="examsPlaces"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import CandilibAutocomplete from '../CandilibAutocomplete'
import TimeSlotCandidats from '../commons/TimeSlotCandidats'
import { FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST, FETCH_CANDIDATS_BY_IPCSR_DATE_REQUEST } from '@/store'
import { getFrenchLuxonCurrentDateTime, getFrenchLuxonFromIso, getFrenchDateShort, getFrenchDateTimeFromIso } from '@/util'

export default {
  components: {
    CandilibAutocomplete,
    TimeSlotCandidats,
  },
  data () {
    return {
      fetchAutocompleteAction: FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST,
      ipcsrSelected: undefined,
      dateExam: getFrenchLuxonCurrentDateTime().minus({ days: 1 }).startOf('day').toISODate(),
      menuDate: false,
    }
  },
  computed: {
    ...mapState({
      matchingInspecteurs: state => state.adminSearch.inspecteurs.list.map(inspecteur => ({
        text: `${inspecteur.prenom} ${inspecteur.nom} - ${inspecteur.matricule}`,
        _id: inspecteur._id,
      })),
      examsPlaces: state => {
        const list = state.adminSearch.candidatsByIpcsrDate.list || []
        return list.map(place => ({ hour: getFrenchDateTimeFromIso(place.date), candidat: place.candidat, reason: place.archiveReasons }))
      },
    }),
    pickerDateExmen () {
      return getFrenchDateShort(getFrenchLuxonFromIso(this.dateExam))
    },
  },
  watch: {
    async dateExam () {
      await this.getPlacesExam()
    },
    async ipcsrSelected () {
      await this.getPlacesExam()
    },
  },
  methods: {
    ipcsrSelect (inspecteur) {
      this.ipcsrSelected = inspecteur._id
    },

    async getPlacesExam () {
      try {
        if (!this.ipcsrSelected) return

        await this.$store.dispatch(FETCH_CANDIDATS_BY_IPCSR_DATE_REQUEST, { ipcsr: this.ipcsrSelected, date: this.dateExam })
      } catch (error) {
      }
    },
  },
}
</script>
