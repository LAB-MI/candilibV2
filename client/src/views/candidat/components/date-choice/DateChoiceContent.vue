<template>
    <div>
      <v-btn @click="activeDayBlock">
        {{ monthBlock.month }}
      </v-btn>
      <div v-if="statusDayBlock">
        <DateChoiceSubContent v-for="(item, index) in monthBlock.daysAndHoursDispo" :key="index" :item="item">
          <!-- <a @click="activeHoursBlock">
          {{ item.day }}
          </a> -->
          <!-- <div v-if="statusHoursBlock"> -->
            <!-- v-for="(hourDispo, idx) in item.hours" :key="idx" {{ hourDispo }} -->
            <!-- <DateChoiceSubContent v-if="statusDayBlock" ></DateChoiceSubContent> -->
          <!-- </div> -->
        </DateChoiceSubContent>
      </div>
      <hr>
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
      // statusHoursBlock: false,
    }
  },
  methods: {
    activeDayBlock() {
      this.statusDayBlock = !this.statusDayBlock
      console.log('statusDayBlock', this.statusDayBlock)
    },
    // activeHoursBlock() {
    //   this.statusHoursBlock = !this.statusHoursBlock
    //   console.log('statusHoursBlock', this.statusHoursBlock)
    // },
  },
}
</script>

<style>
</style>
