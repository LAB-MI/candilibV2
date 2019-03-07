<template>
  <v-card>
    <section>
      <header class="candidat-section-header">
        <h2
          class="candidat-section-header__title"
          v-ripple
          @click="goToSelectCenter()"
        >
          <v-btn icon>
            <v-icon>
              arrow_back_ios
            </v-icon>
          </v-btn>
          {{ center.selected ? center.selected.nom : '' }}
          ({{ center.selected ? center.selected.departement : '' }})
        </h2>
      </header>
    </section>
    <v-tabs
      v-model="switchTab"
      centered
      slider-color="primary"
      color="#dfdfdf"
    >
      <v-tab v-for="(month, i) in timeSlots.list" :key="i" :href="`#tab-${month.month}`">
        <span class="color-span">{{ month.month }}</span>
      </v-tab>
    </v-tabs>
    <v-tabs-items class="tabs-items-block" v-model="switchTab">
      <v-tab-item v-for="(timeSlot, i) in timeSlots.list" :key="i" :value="`tab-${timeSlot.month}`">
        <v-card flat>
          <v-card-text>
            <times-slots-selector :items="timeSlot.availableTimeSlots"/>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'

import TimesSlotsSelector from './TimesSlotsSelector'
import { FETCH_DATES_REQUEST } from '@/store/time-slots'
import { FETCH_CENTER_REQUEST } from '@/store/center'

export default {
  components: {
    TimesSlotsSelector,
  },

  data () {
    return {
      statusDayBlock: false,
      switchTab: null,
    }
  },

  computed: {
    ...mapState(['center', 'timeSlots']),
  },

  methods: {
    activeDayBlock () {
      this.statusDayBlock = !this.statusDayBlock
    },

    async getTimeSlots () {
      const selected = this.center.selected
      if (!selected || !selected._id) {
        if (!this.center.isFetchingCenter) {
          const { center: nom, departement } = this.$route.params
          await this.$store.dispatch(FETCH_CENTER_REQUEST, { nom, departement })
        }
        setTimeout(this.getTimeSlots, 100)
        return
      }
      await this.$store.dispatch(FETCH_DATES_REQUEST, selected._id)
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
