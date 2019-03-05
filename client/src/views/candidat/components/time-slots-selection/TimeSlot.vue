<template>
  <div>
    <v-tabs>
      <v-toolbar
        dark
        fixed
        tabs
      >
        <h1>{{centre.nom}}</h1>
        <template v-slot:extension>
          <v-tabs
            v-model="switchTab"
            centered
            color="dark"
            slider-color="yellow"
          >
            <v-tab v-for="(month, i) in timeSlots" :key="i" :href="`#tab-${month.month}`">
              <span class="color-span">{{ month.month }}</span>
            </v-tab>
          </v-tabs>
        </template>
      </v-toolbar>
      <v-tabs-items class="tabs-items-block" v-model="switchTab">
        <v-tab-item v-for="(timeSlot, i) in timeSlots" :key="i" :value="`tab-${timeSlot.month}`">
          <v-card flat>
            <v-card-text>
              <times-slots-selector :items="timeSlot.availableTimeSlots" />
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>
  </div>
</template>

<script>
import TimesSlotsSelector from './TimesSlotsSelector'
import { FETCH_DATES_REQUEST } from '@/store/time-slots'
export default {
  components: {
    TimesSlotsSelector,
  },
  props: {
    selectedCenter: Object,
    centre: {
      type: Object,
      default: {
        nom: '<Centre>',
      }
    }
  },
  data () {
    return {
      centers: [],
      timeSlots: [],
      statusDayBlock: false,
      switchTab: null,
    }
  },
  methods: {
    activeDayBlock () {
      this.statusDayBlock = !this.statusDayBlock
    },
  },
  beforeMount () {
    this.$store.dispatch(FETCH_DATES_REQUEST, {})
    this.timeSlots = this.$store.state.timeSlots.list
    console.log('TCL: beforeMount -> timeSlots', this.timeSlots, this.$store.state.timeSlots.list)
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
