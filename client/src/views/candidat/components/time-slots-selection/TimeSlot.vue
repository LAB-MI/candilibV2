<template>
  <div>
    <v-toolbar
      dark
    >
      <v-btn @click="goToSelectCenter()">
        <v-icon>
          arrow_back_ios
        </v-icon>
        {{ selectedCenter.nom }} ({{ selectedCenter.departement }})
      </v-btn>
      <a
        target="_blank"
        class="location-icon"
        @click.stop="true"
        v-ripple
        :href="`https://www.openstreetmap.org/search?query=${selectedCenter.adresse.replace(',', ' ').replace(/FR.*/, '')}`"
      >
        <v-icon>
          location_on
        </v-icon>
      </a>
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
    <v-tabs>
      <v-tabs-items class="tabs-items-block" v-model="switchTab">
        <v-tab-item v-for="(timeSlot, i) in timeSlots" :key="i" :value="`tab-${timeSlot.month}`">
          <v-card flat>
            <v-card-text>
              <times-slots-selector :items="timeSlot.availableTimeSlots"/>
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

  data () {
    return {
      selectedCenter: this.$store.state.center.selected,
      timeSlots: [],
      statusDayBlock: false,
      switchTab: null,
    }
  },

  methods: {
    activeDayBlock () {
      this.statusDayBlock = !this.statusDayBlock
    },

    async getTimeSlots () {
      const { selected } = this.$store.state.center
      if (!selected || !selected._id) {
        setTimeout(this.getCenters, 100)
        return
      }
      await this.$store.dispatch(FETCH_DATES_REQUEST, selected._id)
      this.timeSlots = this.$store.state.timeSlots.list
    },

    goToSelectCenter () {
      this.$router.push({
        name: 'selection-centre',
      })
    },
  },

  async mounted () {
    await this.getTimeSlots()
  },
}
</script>
