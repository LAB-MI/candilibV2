<template>
  <v-card>
    <v-card-title>
      <section class="u-max-width">
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
    </v-card-title>
    <v-tabs
      v-model="switchTab"
      centered
      slider-color="primary"
      color="#dfdfdf"
    >
      <v-tab
        v-for="month in timeSlots.list"
        :key="month.month"
        :href="`#tab-${month.month}`"
        @click="$router.push({ name: 'time-slot' })"
      >
        <span v-if="month.availableTimeSlots.length" class="color-span">{{ month.month }}</span>
        <span v-else class="blue-grey--text">{{ month.month }}</span>
      </v-tab>
    </v-tabs>
    <v-tabs-items class="tabs-items-block" v-model="switchTab">
      <v-tab-item v-for="timeSlot in timeSlots.list" :key="timeSlot.month" :value="`tab-${timeSlot.month}`">
      <v-card flat>
        <v-card-text>
        <times-slots-selector v-if="timeSlot.availableTimeSlots.length" :initial-time-slots="timeSlot.availableTimeSlots"/>
        <div v-else class="blue-grey--text  font-italic">Il n'y a plus de crénaux disponible pour ce mois</div>
        </v-card-text>
      </v-card>
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'

import TimesSlotsSelector from './TimesSlotsSelector'
import { FETCH_CENTER_REQUEST, FETCH_DATES_REQUEST } from '@/store'

export default {
  components: {
    TimesSlotsSelector,
  },

  data () {
    return {
      timeoutid: undefined,
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
        this.timeoutid = setTimeout(this.getTimeSlots, 100)
        return
      }
      await this.$store.dispatch(FETCH_DATES_REQUEST, selected._id)
      this.timeoutid = setTimeout(this.getTimeSlots, 5000)
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

  async destroyed () {
    clearTimeout(this.timeoutid)
  },
}
</script>

<style>
.color-span {
  color: rgb(22, 157, 178);
}
</style>
