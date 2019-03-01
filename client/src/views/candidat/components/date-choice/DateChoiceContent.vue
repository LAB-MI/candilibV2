<template>
  <div>
    <!-- <v-toolbar dark fixed>
         <v-toolbar-title>Title</v-toolbar-title>
    </v-toolbar> -->
      <v-tabs
          fixed-tabs
          centered
          color="red"
          dark
          next-icon="mdi-arrow-right-bold-box-outline"
          prev-icon="mdi-arrow-left-bold-box-outline"
          show-arrows
      >
        <v-tabs-slider color="black"></v-tabs-slider>
        <v-toolbar dark fixed>
        <v-tab v-for="(month, index) in monthBlock" :key="index" :href="'#tab-'+ month.month">
          {{ month.month }}
        </v-tab>
        </v-toolbar>
        <v-tabs-items>
        <v-tab-item
          v-for="i in monthBlock"
          :key="i"
          :value="'tab-' + i.month"
        >
          <v-card flat>
            <v-card-text>
              <date-choice-sub-content :items="i.daysAndHoursDispo">
              </date-choice-sub-content>
            </v-card-text>
          </v-card>
        </v-tab-item>
        </v-tabs-items>
      </v-tabs>
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
