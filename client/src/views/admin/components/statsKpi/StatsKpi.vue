<template>
  <v-container>
    <page-title :title="'Stats Kpi'"/>
    <v-container
      style="display: block;"
    >
      <v-layout>
        <v-flex>
          <v-menu
            v-model="menuStart"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            readonly
            full-width
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="pickerDateStart"
                label="Date de debut de période"
                prepend-icon="event"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="dateStart" @input="menuStart = false" locale="fr"></v-date-picker>
          </v-menu>
        </v-flex>
        <v-flex>
          <v-menu
            v-model="menuEnd"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            readonly
            full-width
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="pickerDateEnd"
                label="Date de fin de période"
                prepend-icon="event"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="dateEnd" @input="menuEnd = false" locale="fr"></v-date-picker>
          </v-menu>
        </v-flex>
      </v-layout>
      <v-btn color="primary" @click="getStatsKpi(true)">
        {{ $formatMessage({ id: 'export_stats_csv' }) }}
        <v-icon>
          get_app
        </v-icon>
        <v-icon>
          assessment
        </v-icon>
      </v-btn>
      <v-btn color="primary" @click="getStatsKpi(true, true)">
        {{ $formatMessage({ id: 'export_places_stats_csv' }) }}
        <v-icon>
          get_app
        </v-icon>
        <v-icon>
          assessment
        </v-icon>
      </v-btn>
      <v-switch v-model="isDisplayAllDepartement" :label="`Afficher tous les département`"></v-switch>
    </v-container>

    <v-flex
      v-if="isShowOneDepartement"
      class="pa-5"
    >
      <charts-stats-kpi
        :statsResultsExamValues="currentStatsResultExam"
        :statsPlacesExamValues="currentStatsPlacesExam"
      />
    </v-flex>

    <v-flex
      v-else
      v-for="(elem, index) in statsResultsExamCandidats"
      :key="'elem'+index"
      class="pa-5"
    >
      <charts-stats-kpi :statsResultsExamValues="elem"/>
    </v-flex>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'
import api from '@/api'
import { downloadContent, getFrenchLuxonCurrentDateTime } from '@/util'
import ChartsStatsKpi from './ChartsStatsKpi.vue'

export default {
  components: {
    ChartsStatsKpi,
  },

  async mounted () {
    await this.getStatsKpi(false)
    await this.getStatsKpi(false, true)
  },

  computed: {
    ...mapGetters(['activeDepartement']),
    pickerDateStart () {
      return this.dateStart.split('-').reverse().join('/')
    },
    pickerDateEnd () {
      return this.dateEnd.split('-').reverse().join('/')
    },

    isShowOneDepartement () {
      return this.currentStatsResultExam &&
        this.currentStatsResultExam.departement &&
        this.currentStatsPlacesExam &&
        this.currentStatsPlacesExam.departement &&
        !this.isDisplayAllDepartement
    },
  },

  data: () => ({
    dateStart: getFrenchLuxonCurrentDateTime().plus({ month: -1 }).toISODate(),
    dateEnd: getFrenchLuxonCurrentDateTime().toISODate(),
    menuStart: false,
    menuEnd: false,
    statsResultsExamCandidats: [],
    statsPlacesExamCandidats: [],
    currentStatsResultExam: {},
    currentStatsPlacesExam: {},
    isDisplayAllDepartement: false,
  }),

  methods: {
    async getStatsKpi (isCsv, isPlacesExam = false) {
      const beginPeriode = this.dateStart
      const endPeriode = this.dateEnd

      const response = await api.admin.exportStatsKpi(beginPeriode, endPeriode, isCsv, isPlacesExam)

      if (isCsv) {
        downloadContent(response)
        return
      }

      if (isPlacesExam) {
        this.statsPlacesExamCandidats = response.statsKpi
        this.currentStatsPlacesExam = this.statsPlacesExamCandidats.find(el => el.departement === this.activeDepartement)
        return
      }

      this.statsResultsExamCandidats = response.statsKpi
      this.currentStatsResultExam = this.statsResultsExamCandidats.find(el => el.departement === this.activeDepartement)
    },
  },

  watch: {
    statsResultsExamCandidats (newValue) {
      this.currentStatsResultExam = newValue &&
      newValue.find(el => el.departement === this.activeDepartement)
    },

    statsPlacesExamCandidats (newValue) {
      this.currentStatsPlacesExam = newValue &&
      newValue.find(el => el.departement === this.activeDepartement)
    },

    activeDepartement () {
      this.currentStatsResultExam = this.statsResultsExamCandidats &&
      this.statsResultsExamCandidats.find(el => el.departement === this.activeDepartement)
    },

    async dateStart () {
      await this.getStatsKpi(false)
      await this.getStatsKpi(false, true)
    },

    async dateEnd () {
      await this.getStatsKpi(false)
      await this.getStatsKpi(false, true)
    },
  },
}
</script>

<style  lang="postcss" scoped>

.export-button {
  display: flex;
  color: #fff;
  justify-content: center;
  align-items: center;
  padding: 1em 0;
  margin: 0 auto;
  max-width: 1160px;

  @media (max-width: 1169px) {
    flex-direction: column;
  }

  &-action {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 1em;
    margin: 1em;
    flex-grow: 1;

    &--export {
      @media (max-width: 1169px) {
        border-top: 1px solid rgba(200, 200, 200, 0.3);
      }

      @media (min-width: 1170px) {
        border-left: 1px solid rgba(200, 200, 200, 0.3);
      }
    }
  }
}

.label-stats {
  margin-left: 4%;
  margin-top: 4%;
}
</style>
