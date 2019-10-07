<template>
  <v-layout>
    <v-progress-circular
      :class="chartInfo.classContent"
      :rotate="chartInfo.rotate"
      :size="chartInfo.size"
      :width="chartInfo.width"
      :value="chartInfo.value"
      :color="chartInfo.colorProgress"
    >
      {{ `${chartInfo.value}` }}%
    </v-progress-circular>
    <v-flex class="pt-2 ma-4">
      <span :color="chartInfo.colorLabel" class="d-flex label-stats"><strong>{{ $formatMessage({ id: chartInfo.formatMessagesIds.id1 }) }}</strong></span>
      <span :color="chartInfo.colorLabel" class="d-flex label-stats">{{ $formatMessage({ id: chartInfo.formatMessagesIds.id2 }) }}</span>
    </v-flex>
    <v-spacer></v-spacer>
  </v-layout>
</template>

<script>
export default {
  props: {
    chartInfo: {
      type: Object,
      default: () => ({
        formatMessagesIds: {
          id1: '',
          id2: '',
        },
        classContent: 'd-block',
        rotate: 90,
        size: 150,
        width: 15,
        value: 0,
        colorProgress: 'primary',
        colorLabel: 'black',
      }),
    },
  },
}
</script>
