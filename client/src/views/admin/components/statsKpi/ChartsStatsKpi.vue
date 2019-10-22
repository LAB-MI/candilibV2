<template>
  <v-card>
    <v-card-title class="justify-center">
      <h3 class="d-block">{{  $formatMessage({ id: 'departement' }) }}<strong> {{ `${statsValues.departement}` }}</strong></h3>
    </v-card-title>
    <v-divider></v-divider>
    <v-layout>
      <v-container>
        <h3>
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
        <h1 class="d-block pl-5 mb-3"><strong>{{ `${getTotalPlace}` }}</strong></h1>
        <span class="d-block"><strong>{{  $formatMessage({ id: 'examens_passes' }) }}</strong></span>
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
    statsValues: {
      type: Object,
    },
  },

  computed: {
    getTotalPlace () {
      return (this.statsValues.absent + this.statsValues.failed + this.statsValues.notExamined + this.statsValues.received) || 0
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
          value: ((this.statsValues.received / this.getTotalPlace) * 100) || 0,
          colorProgress: 'primary',
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
          value: ((this.statsValues.absent / this.getTotalPlace) * 100) || 0,
          colorProgress: 'primary',
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
          value: ((this.statsValues.notExamined / this.getTotalPlace) * 100) || 0,
          colorProgress: 'primary',
          colorLabel: 'black',
        },
      ]
    },
  },
}
</script>
