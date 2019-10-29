<template>
  <v-card>
    <v-card-title class="justify-center">
      <h3 class="d-block">
        {{ $formatMessage({ id: 'departement' }) }}
        <strong>
          {{ `${(statsResultsExamValues && statsResultsExamValues.departement) || this.activeDepartement}` }}
        </strong>
      </h3>
    </v-card-title>

    <v-divider/>

    <div class="stats  u-flex  u-flex--center">

      <div>
        <h3 style="color: #00b0ff;">
          {{ $formatMessage({ id: 'resultats_des_examens' }) }}
        </h3>
        <div class="u-flex  u-flex--wrap  u-flex--center">
          <donuts-chart-content
            class="u-flex__item pa-3"
            v-for="(chartInfo, idx) in getChartsResultsExams()"
            :key="`${chartInfo.classContent}-${idx}`"
            :chartInfo="chartInfo"
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

    <v-divider/>

    <div style="margin-left: 6.5vw;">
      <v-container>
        <h3 style="color: #388e3c;">
          {{ $formatMessage({ id: 'places_examens' }) }}
        </h3>

        <div class="u-flex  u-flex--wrap  u-flex--center">
          <donuts-chart-content
            class="u-flex__item pa-3"
            v-for="(chartInfo, idx) in chartsPlacesExams"
            :key="`${chartInfo.classContent}-${idx}`"
            :chartInfo="chartInfo"
          />
          <div
            :class="`u-flex__item pa-3
              t-number-inscrit-${Math.round(datasets[1].data[0])}
              t-number-future-free-places-${Math.round(datasets[0].data[0])}
              `"
          >
            <chart-bar
              class="chart-wrapper"
              :labels="labels"
              :datasets="datasets"
            />
            <div style="display: block;"></div>
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

export default {
  components: {
    DonutsChartContent,
    ChartBar,
  },

  props: {
    statsResultsExamValues: {
      type: Object,
    },

    statsPlacesExamValues: {
      type: Object,
    },
  },

  data () {
    return {
      labels: [[`Stats:`]],
    }
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

    datasets () {
      const { totalBookedPlaces, totalAvailablePlaces, totalCandidatsInscrits } = this.statsPlacesExamValues || {}
      return [
        {
          label: 'Places disponibles à venir',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 3,
          data: [
            totalAvailablePlaces || 0,
          ],
        },
        {
          label: 'Candidats inscrits',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 3,
          data: [
            totalCandidatsInscrits ? (totalCandidatsInscrits - totalBookedPlaces) : 0,
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
  width: 30vw;
  height: 20vh;
}
</style>
