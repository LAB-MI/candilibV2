<template>
  <div>
    <page-title :title="'Stats Kpi'" />

    <v-card class="container  stats-filters">
      <v-switch
        v-model="isDisplayAllDepartement"
        :label="`Afficher tous les départements`"
      />

      <div class="u-flex">
        <v-menu
          v-model="menuStart"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          readonly
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="pickerDateStart"
              label="Date de début de période"
              prepend-icon="event"
              readonly
              v-on="on"
            />
          </template>

          <v-date-picker
            v-model="dateStart"
            locale="fr"
            @input="menuStart = false"
          />
        </v-menu>

        <v-menu
          v-model="menuEnd"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          readonly
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="pickerDateEnd"
              label="Date de fin de période"
              prepend-icon="event"
              readonly
              v-on="on"
            />
          </template>

          <v-date-picker
            v-model="dateEnd"
            color="red"
            locale="fr"
            @input="menuEnd = false"
          />
        </v-menu>
      </div>

      <div class="u-flex  u-flex--center">
        <v-btn
          color="primary"
          @click="getStatsKpiResultsExams(true)"
        >
          {{ $formatMessage({ id: 'export_stats_csv' }) }}

          <v-icon>
            get_app
          </v-icon>

          <v-icon>
            assessment
          </v-icon>
        </v-btn>

        <v-btn
          color="primary"
          @click="getStatsKpiPlacesExams(true)"
        >
          {{ $formatMessage({ id: 'export_places_stats_csv' }) }}

          <v-icon>
            get_app
          </v-icon>

          <v-icon>
            assessment
          </v-icon>
        </v-btn>

        <v-btn
          color="primary"
          @click="getStatsKpiCandidatsRetention(true)"
        >
          {{ $formatMessage({ id: 'export_candidats_retention_stats_csv' }) }}

          <v-icon>
            get_app
          </v-icon>

          <v-icon>
            assessment
          </v-icon>
        </v-btn>
      </div>
    </v-card>

    <v-flex
      v-if="!isDisplayAllDepartement"
      style="margin-top: 8vh; display: block;"
      class="pa-5"
    >
      <charts-stats-kpi
        :stats-results-exam-values="currentStatsResultExam"
        :stats-places-exam-values="currentStatsPlacesExam"
        :stats-nb-candidat-leave-retention-area="currentStatsCandidatsLeaveRetentionArea"
        :stats-nb-candidat-leave-retention-area-by-week="currentStatsCandidatLeaveRetentionAreaByWeek"
      />
    </v-flex>

    <v-flex
      v-for="(elem, index) in (statsResultsExams ? statsResultsExams.statsKpi : [])"
      v-else
      :key="'elem'+index"
      style="margin-top: 13vh; display: block;"
    >
      <charts-stats-kpi
        :stats-results-exam-values="elem"
        :stats-places-exam-values="selectStatsKpiPlacesExamsByDpt(elem.departement)"
        :stats-nb-candidat-leave-retention-area="selectStatsKpiCandidatsRetentionByDpt(elem.departement)"
        :stats-nb-candidat-leave-retention-area-by-week="setStatsCandidatLeaveRetentionAreaByWeek(elem.departement)"
      />
    </v-flex>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { downloadContent, getFrenchLuxonCurrentDateTime } from '@/util'
import ChartsStatsKpi from './ChartsStatsKpi.vue'
import {
  FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_BY_WEEK_REQUEST,
  FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_REQUEST,
  FETCH_STATS_KPI_PLACES_EXAMS_REQUEST,
  FETCH_STATS_KPI_RESULTS_EXAMS_REQUEST,
} from '@/store'

export default {
  components: {
    ChartsStatsKpi,
  },

  data: () => ({
    dateStart: getFrenchLuxonCurrentDateTime().plus({ month: -1 }).toISODate(),
    dateEnd: getFrenchLuxonCurrentDateTime().toISODate(),
    menuStart: false,
    menuEnd: false,
    isDisplayAllDepartement: false,
  }),

  computed: {
    ...mapGetters([
      'activeDepartement',
      'isFetchingResultsExams',
      'isFetchingPlacesExams',
      'statsResultsExams',
      'statsPlacesExams',
      'statsCandidatLeaveRetentionArea',
      'statsCandidatLeaveRetentionAreaByWeek',
    ]),

    currentStatsResultExam () {
      return (this.statsResultsExams && this.statsResultsExams.statsKpi)
        ? this.statsResultsExams.statsKpi.find(el => el.departement === this.activeDepartement)
        : {}
    },

    currentStatsPlacesExam () {
      return (this.statsPlacesExams && this.statsPlacesExams.statsKpi)
        ? this.statsPlacesExams.statsKpi.find(el => el.departement === this.activeDepartement)
        : {}
    },

    currentStatsCandidatsLeaveRetentionArea () {
      const { statsKpiCandidatsLeaveRetention } = this.statsCandidatLeaveRetentionArea || {}
      return (statsKpiCandidatsLeaveRetention && statsKpiCandidatsLeaveRetention)
        ? statsKpiCandidatsLeaveRetention.find(el => el._id === this.activeDepartement)
        : {}
    },

    currentStatsCandidatLeaveRetentionAreaByWeek () {
      const statsCandidatLeaveRetentionAreaByWeek = this.statsCandidatLeaveRetentionAreaByWeek || []
      return statsCandidatLeaveRetentionAreaByWeek[0] ? statsCandidatLeaveRetentionAreaByWeek[0].candidatsLeaveRetentionByWeek : []
    },

    pickerDateStart () {
      return this.dateStart.split('-').reverse().join('/')
    },

    pickerDateEnd () {
      return this.dateEnd.split('-').reverse().join('/')
    },

    departementSelected () {
      return this.isDisplayAllDepartement ? undefined : this.activeDepartement
    },
  },

  watch: {
    async activeDepartement () {
      await this.updateAllStats()
    },

    async dateStart () {
      this.setRouteParams()
      await this.updateAllStats()
    },

    async dateEnd () {
      this.setRouteParams()
      await this.updateAllStats()
    },

    async isDisplayAllDepartement () {
      await this.updateAllStats()
    },
  },

  async mounted () {
    const { begin, end } = this.$route.params
    if (begin && end) {
      this.dateStart = begin
      this.dateEnd = end
    } else {
      this.setRouteParams()
    }
    await this.updateAllStats()
  },

  methods: {
    async updateAllStats () {
      await this.getStatsKpiPlacesExams()
      await this.getStatsKpiResultsExams()
      await this.getStatsKpiCandidatsRetention()
      await this.getStatsKpiCandidatsRetentionByWeek()
    },

    setRouteParams () {
      this.$router.push({
        name: 'stats-kpi',
        params: {
          begin: `${this.dateStart}`,
          end: `${this.dateEnd}`,
        },
      })
    },

    async getStatsKpiPlacesExams (isCsv = false) {
      await this.$store.dispatch(FETCH_STATS_KPI_PLACES_EXAMS_REQUEST, {
        isCsv,
        departement: this.departementSelected,
      })

      if (isCsv) {
        downloadContent(this.statsPlacesExams)
      }
    },

    async getStatsKpiCandidatsRetention (isCsv = false) {
      await this.$store.dispatch(FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_REQUEST, {
        beginPeriode: this.dateStart,
        endPeriode: this.dateEnd,
        isCsv,
        departement: this.departementSelected,
      })

      if (isCsv) {
        downloadContent(this.statsCandidatLeaveRetentionArea)
      }
    },

    async getStatsKpiCandidatsRetentionByWeek () {
      if (!this.isDisplayAllDepartement) {
        await this.$store.dispatch(
          FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_BY_WEEK_REQUEST,
          this.activeDepartement || undefined,
        )
        return
      }
      await this.$store.dispatch(
        FETCH_STATS_KPI_CANDIDAT_IN_RETENTION_BY_WEEK_REQUEST,
        undefined,
      )
    },

    setStatsCandidatLeaveRetentionAreaByWeek (departement) {
      const statsCandidatLeaveRetentionAreaByWeek = this.statsCandidatLeaveRetentionAreaByWeek || []
      const foundStats = statsCandidatLeaveRetentionAreaByWeek.find(el => el.departement === departement)
      return foundStats ? foundStats.candidatsLeaveRetentionByWeek : []
    },

    async getStatsKpiResultsExams (isCsv = false) {
      await this.$store.dispatch(FETCH_STATS_KPI_RESULTS_EXAMS_REQUEST, {
        beginPeriode: this.dateStart,
        endPeriode: this.dateEnd,
        isCsv,
        departement: this.departementSelected,
      })

      if (isCsv) {
        downloadContent(this.statsResultsExams)
      }
    },

    selectStatsKpiPlacesExamsByDpt (departement) {
      return this.statsPlacesExams
        ? this.statsPlacesExams.statsKpi.find(el => el.departement === departement)
        : {}
    },

    selectStatsKpiCandidatsRetentionByDpt (departement) {
      const { statsKpiCandidatsLeaveRetention } = this.statsCandidatLeaveRetentionArea || {}

      return statsKpiCandidatsLeaveRetention
        ? statsKpiCandidatsLeaveRetention.find(el => el._id === departement)
        : {}
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

.stats-filters {
  position: sticky;
  top: 4.5em;
  z-index: 2;
  margin-top: 1em;
}
</style>
