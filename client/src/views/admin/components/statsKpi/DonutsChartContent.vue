<template>
  <div :class="`u-flex  u-flex--center ${myChartInfo.idCypress}`">
    <v-progress-circular
      :class="myChartInfo.classContent"
      :rotate="myChartInfo.rotate"
      :size="myChartInfo.size"
      :width="myChartInfo.width"
      :value="myChartInfo.value"
      :color="myChartInfo.colorProgress"
    >
      {{ `${myChartInfo.value}` }}%
    </v-progress-circular>
    <v-flex class="pt-2 ma-4">
      <span
        :color="myChartInfo.colorLabel"
        class="d-flex label-stats"
      >
        <strong>
          {{ myChartInfo.title }}
        </strong>
      </span>
      <span
        :color="myChartInfo.colorLabel"
        class="d-flex label-stats"
      >
        {{ myChartInfo.description }}
      </span>
    </v-flex>
  </div>
</template>

<script>
const defaultChartInfo = {
  title: '',
  description: '',
  rotate: -90,
  size: 150,
  width: 15,
  value: 0,
  colorProgress: 'primary',
  colorLabel: 'black',
}

export default {
  props: {
    chartInfo: {
      type: Object,
      default () {},
    },
  },

  computed: {
    myChartInfo () {
      return {
        ...defaultChartInfo,
        ...this.chartInfo,
      }
    },
  },
}
</script>
