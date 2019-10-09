<template>
  <v-card>
    <v-card-title class="justify-center">
      <h3 class="d-block">{{  $formatMessage({ id: 'departement' }) }}<strong> {{ `${statsResultsExamValues.departement}` }}</strong></h3>
    </v-card-title>

    <v-divider/>

    <v-layout>

      <v-container>
        <h3 style="color: #00b0ff;">
          {{  $formatMessage({ id: 'resultats_a_lexamen' }) }}
        </h3>
          <v-layout>
            <chart-content
              v-for="(chartInfo, idx) in getChartsResultsExams()"
              :key="`${chartInfo.classContent}-${idx}`"
              :chartInfo="chartInfo"
            />
          </v-layout>
      </v-container>

      <v-container>
        <h1 class="d-block pl-5 mb-3">
          <strong>
            {{ `${getTotalPlace()}` }}
          </strong>
        </h1>
        <span class="d-block">
          <strong>
            {{  $formatMessage({ id: 'examens_passes' }) }}
          </strong>
        </span>
      </v-container>

    </v-layout>

    <v-divider/>

    <v-layout>
      <v-container>
        <h3 style="color: #388e3c;">
          {{  $formatMessage({ id: 'places_examens' }) }}
        </h3>
        <v-layout>
          <chart-content
            v-for="(chartInfo, idx) in getChartsPlacesExams()"
            :key="`${chartInfo.classContent}-${idx}`"
            :chartInfo="chartInfo"
          />
        </v-layout>
      </v-container>
    </v-layout>
  </v-card>
</template>

<script>
import ChartContent from './ChartContent.vue'

export default {
  components: {
    ChartContent,
  },

  props: {
    statsResultsExamValues: {
      type: Object,
    },

    statsPlacesExamValues: {
      type: Object,
    },
  },

  computed: {
    getPourcentPlacesExamBookedOrNot () {
      return Math.round(((this.statsPlacesExamValues && this.statsPlacesExamValues.totalBookedPlaces) / (this.statsPlacesExamValues && this.statsPlacesExamValues.totalPlaces)) * 100)
    },

    getTotalPlace () {
      return (this.statsResultsExamValues.absent + this.statsResultsExamValues.failed + this.statsResultsExamValues.notExamined + this.statsResultsExamValues.received) || 0
    },
  },

  methods: {
    getChartsResultsExams () {
      return [
        {
          formatMessagesIds: {
            id1: 'de_reussite',
            id2: 'egale_recus_divise_reçus_plus_echecs',
          },
          classContent: 'd-block',
          rotate: 90,
          size: 150,
          width: 15,
          value: ((this.statsResultsExamValues.received / this.getTotalPlace()) * 100) || 0,
          colorProgress: '#00B0FF',
          colorLabel: 'black',
        },
        {
          formatMessagesIds: {
            id1: 'd_absenteisme',
            id2: 'egale_absents_divise_examens_passes',
          },
          classContent: 'd-block',
          rotate: 90,
          size: 150,
          width: 15,
          value: ((this.statsResultsExamValues.absent / this.getTotalPlace()) * 100) || 0,
          colorProgress: '#00B0FF',
          colorLabel: 'black',
        },
        {
          formatMessagesIds: {
            id1: 'de_non_examines',
            id2: 'egale_non_examinés_divise_examens_passes',
          },
          classContent: 'd-block',
          rotate: 90,
          size: 150,
          width: 15,
          value: ((this.statsResultsExamValues.notExamined / this.getTotalPlace()) * 100) || 0,
          colorProgress: '#00B0FF',
          colorLabel: 'black',
        },
      ]
    },

    getChartsPlacesExams () {
      return [
        {
          formatMessagesIds: {
            id1: 'de_remplissage_de_places_a_venir',
            id2: 'egale_reservation_a_venir_divise_places_proposees_dans_le_futur',
          },
          classContent: 'd-block',
          rotate: 90,
          size: 150,
          width: 15,
          value: this.getPourcentPlacesExamBookedOrNot,
          colorProgress: '#388E3C',
          colorLabel: 'black',
        },
      ]
    },
  },
}
</script>
