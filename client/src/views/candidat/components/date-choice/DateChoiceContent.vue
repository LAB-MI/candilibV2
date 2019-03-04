<template>
  <div>
    <v-tabs>
      <v-toolbar
        dark
        fixed
        tabs
        >
        <h1>CENTER INFO</h1>
         <template v-slot:extension>
        <v-tabs
          v-model="switchTab"
          centered
          color="dark"
          slider-color="yellow"
        >
          <v-tab v-for="(month, index) in monthBlock" :key="index" :href="'#tab-'+ month.month">
          <span class="color-span">{{ month.month }}</span>
        </v-tab>
        </v-tabs>
      </template>
      </v-toolbar>
      <v-tabs-items class="tabs-items-block" v-model="switchTab">
        <v-tab-item v-for="i in monthBlock" :key="i" :value="'tab-' + i.month">
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
      switchTab: null,
    }
  },
  methods: {
    activeDayBlock () {
      this.statusDayBlock = !this.statusDayBlock
    },
  },
}
</script>

<style>
  .color-span {
    color: white;
  }

  .tabs-items-block {
    margin-top: 50px;
  }
</style>
