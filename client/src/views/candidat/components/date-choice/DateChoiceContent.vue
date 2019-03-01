<template>
  <div class="text-xs">
    <v-btn @click="activeDayBlock">
        {{ monthBlock.month }}
    </v-btn>
    <v-bottom-sheet v-model="statusDayBlock">
      <v-card>
        <DateChoiceSubContent :items="monthBlock.daysAndHoursDispo">
        </DateChoiceSubContent>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>
import DateChoiceSubContent from './DateChoiceSubContent'

export default {
  components: {
    DateChoiceSubContent,
  },
  props: {
    monthBlock: Object,
  },
  data () {
    return {
      statusDayBlock: false,
    }
  },
  methods: {
    activeDayBlock () {
      this.statusDayBlock = !this.statusDayBlock
      console.log('statusDayBlock', this.statusDayBlock)
    },
  },
}
</script>

<style>
</style>
