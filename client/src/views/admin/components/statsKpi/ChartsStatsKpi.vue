<template>
  <v-card style="border-radius: 3%;">
    <v-card-title class="justify-center">
      <h3 class="d-block">
        {{ $formatMessage({ id: 'departement' }) }}
        <strong>
          {{ `${(statsResultsExamValues && statsResultsExamValues.departement) || activeDepartement}` }}
        </strong>
      </h3>
    </v-card-title>

    <v-divider />

    <div class="stats  u-flex  u-flex--center">
      <div>
        <h3 style="color: #00b0ff;">
          {{ $formatMessage({ id: 'resultats_des_examens' }) }}
        </h3>
        <div class="u-flex  u-flex--wrap  u-flex--center">
          <donuts-chart-content
            v-for="(chartInfo, idx) in getChartsResultsExams()"
            :key="`${chartInfo.classContent}-${idx}`"
            class="u-flex__item pa-3"
            :chart-info="chartInfo"
          />
          <div class="u-flex__item">
            <strong :class="`total-places t-total-places-${Math.round(getTotalExamPlaces)}`">
              {{ `${getTotalExamPlaces}` }}
            </strong>
            <strong class="d-block">
              {{ $formatMessage({ id: 'examens_passes' }) }}
            </strong>
          </div>
        </div>
      </div>
    </div>

    <v-divider />

    <div style="margin-left: 6.5vw;">
      <v-container>
        <h3 style="color: #388e3c;">
          {{ $formatMessage({ id: 'places_examens' }) }}
        </h3>

        <div class="u-flex  u-flex--wrap  u-flex--center">
          <donuts-chart-content
            v-for="(chartInfo, idx) in chartsPlacesExams"
            :key="`${chartInfo.classContent}-${idx}`"
            class="u-flex__item pa-3"
            :chart-info="chartInfo"
          />
          <div
            :class="`u-flex__item pa-3
              t-number-inscrit-${Math.round(datasets[1].data[0])}
              t-number-future-free-places-${Math.round(datasets[0].data[0])}
              `"
          >
            <chart-bar
              class="chart-wrapper"
              :labels="labelsHorizontal"
              :datasets="datasets"
            />
            <div style="display: block;" />
          </div>
        </div>
      </v-container>
    </div>

    <v-divider />

    <div>
      <v-container>
        <h3>
          {{ $formatMessage({ id: 'candidats_sortant_de_retention_par_semaine' }) }}
        </h3>

        <div class="u-flex  u-flex--wrap  u-flex--center">
          <div
            class="`u-flex__item pa-3"
          >
            <chart-bar-vertical
              class="chart-vertical-wrapper"
              :labels="labelsVertical"
              :datasets="datasetsVerticalChart"
            />
            <div style="display: block;" />
          </div>
        </div>
      </v-container>
    </div>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'
import DonutsChartContent from './DonutsChartContent.vue'
import ChartBar from './ChartBar.vue'
import ChartBarVertical from './ChartBarVertical.vue'

export default {
  components: {
    DonutsChartContent,
    ChartBar,
    ChartBarVertical,
  },

  props: {
    statsResultsExamValues: {
      type: Object,
      default () {},
    },

    statsPlacesExamValues: {
      type: Object,
      default () {},
    },

    statsNbCandidatLeaveRetentionArea: {
      type: Object,
      default () {},
    },

    statsNbCandidatLeaveRetentionAreaByWeek: {
      type: Array,
      default () { return [] },
    },
  },

  computed: {
    ...mapGetters(['activeDepartement']),
    getTotalExamPlaces () {
      return (
        this.statsResultsExamValues &&
        (
          this.statsResultsExamValues.absent +
          this.statsResultsExamValues.failed +
          this.statsResultsExamValues.notExamined +
          this.statsResultsExamValues.received
        )
      ) || 0
    },
    labelsHorizontal () {
      return [['Stats:']]
    },

    labelsVertical () {
      const dataCountCandidatByWeek = this.statsNbCandidatLeaveRetentionAreaByWeek || []
      return dataCountCandidatByWeek.map(el => el.weekDate)
    },

    receiveAndFaildPlaces () {
      return (
        this.statsResultsExamValues &&
        (
          this.statsResultsExamValues.failed +
          this.statsResultsExamValues.received
        )
      ) || 0
    },

    percentPlacesExamBookedOrNot () {
      const totalBookedPlaces = (this.statsPlacesExamValues && this.statsPlacesExamValues.totalBookedPlaces) || 0
      const totalAvailablePlaces = (this.statsPlacesExamValues && this.statsPlacesExamValues.totalAvailablePlaces) || 0
      return (((totalBookedPlaces / (totalAvailablePlaces + totalBookedPlaces)) * 100) || 0).toFixed(2)
    },

    chartsPlacesExams () {
      return [
        {
          title: this.$formatMessage({ id: 'de_remplissage_de_places_a_venir' }),
          description: this.$formatMessage({ id: 'egale_reservation_a_venir_divise_places_proposees_dans_le_futur' }),
          value: this.percentPlacesExamBookedOrNot,
          colorProgress: '#388E3C',
          idCypress: 't-remplissage-futur',
        },
      ]
    },

    datasetsVerticalChart () {
      const dataCountCandidatByWeek = this.statsNbCandidatLeaveRetentionAreaByWeek || []

      return [{
        label: 'Candidats sortant de la zone de rétention par semaine',
        backgroundColor: [
          'rgba(255, 0, 64, 0.2)',
          'rgba(255, 0, 64, 0.2)',
          'rgba(255, 0, 64, 0.2)',
          'rgba(255, 0, 64, 0.2)',
          'rgba(255, 0, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 0, 0, 1)',
          'rgba(255, 0, 0, 1)',
          'rgba(255, 0, 0, 1)',
          'rgba(255, 0, 0, 1)',
          'rgba(255, 0, 0, 1)',
        ],
        borderWidth: 3,
        data: dataCountCandidatByWeek.map(el => (el.value || 0) && el.value.count),
      }]
    },

    datasets () {
      const { totalBookedPlaces, totalAvailablePlaces, totalCandidatsInscrits } = this.statsPlacesExamValues || {}
      const { count } = this.statsNbCandidatLeaveRetentionArea || {}
      return [
        {
          label: 'Places disponibles',
          backgroundColor: 'rgba(96, 224, 64, 0.2)',
          borderColor: 'rgba(96, 192, 0, 1)',
          borderWidth: 3,
          data: [
            totalAvailablePlaces || 0,
          ],
        },
        {
          label: 'Candidats sans réservation et hors de la zone de rétention',
          backgroundColor: 'rgba(64, 96, 255, 0.2)',
          borderColor: 'rgba(64, 32, 224, 1)',
          borderWidth: 3,
          data: [
            totalCandidatsInscrits ? (totalCandidatsInscrits - totalBookedPlaces) : 0,
          ],
        },
        {
          label: 'Candidats sortant de la zone de rétention sur la periode sélectionnée',
          backgroundColor: 'rgba(255, 0, 64, 0.2)',
          borderColor: 'rgba(255, 0, 0, 1)',
          borderWidth: 3,
          data: [
            count || 0,
          ],
        },
      ]
    },
  },

  methods: {
    getChartsResultsExams () {
      const totalPlacesCount = this.getTotalExamPlaces
      const { received, absent, notExamined } = this.statsResultsExamValues || {}

      return [
        {
          title: this.$formatMessage({ id: 'de_reussite' }),
          description: this.$formatMessage({ id: 'egale_recus_divise_reçus_plus_echecs' }),
          value: (((received / this.receiveAndFaildPlaces) * 100) || 0).toFixed(2),
          colorProgress: '#00B0FF',
          idCypress: 't-reussite',
        },
        {
          title: this.$formatMessage({ id: 'd_absenteisme' }),
          description: this.$formatMessage({ id: 'egale_absents_divise_examens_passes' }),
          value: (((absent / totalPlacesCount) * 100) || 0).toFixed(2),
          colorProgress: '#00B0FF',
          idCypress: 't-absenteisme',
        },
        {
          title: this.$formatMessage({ id: 'de_non_examines' }),
          description: this.$formatMessage({ id: 'egale_non_examinés_divise_examens_passes' }),
          value: (((notExamined / totalPlacesCount) * 100) || 0).toFixed(2),
          colorProgress: '#00B0FF',
          idCypress: 't-non-examines',
        },
      ]
    },
  },
}
</script>

<style lang="stylus" scoped>
.stats {
  padding: 1em;
}

.total-places {
  display: block;
  margin: 0 0.4em;
  font-size: 2em;
  margin-left: 3vw;
}

.chart-wrapper {
  width: 35vw;
  height: 25vh;
}

.chart-vertical-wrapper {
  width: 55vw;
  height: 25vh;
}
</style>
