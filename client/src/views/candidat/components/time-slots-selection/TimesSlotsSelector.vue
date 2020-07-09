<template>
  <v-list>
    <v-list-group
      v-for="timeSlot in timeSlots"
      :key="timeSlot.label"
      v-model="timeSlot.active"
      class="t-time-slot-list-group"
      :prepend-icon="timeSlot.action"
      no-action
      @click="gotoDay(timeSlot.label)"
    >
      <template v-slot:activator>
        <keep-alive>
          <v-list-item-content>
            <v-list-item-title>
              {{ timeSlot.label }}
            </v-list-item-title>
          </v-list-item-content>
        </keep-alive>
      </template>

      <v-container
        class="scroll-y"
      >
        <v-btn
          v-for="hour in timeSlot.slots"
          :key="hour"
          color="primary"
          @click="selectSlot({ hour, day: timeSlot.label })"
        >
          {{ hour }}
        </v-btn>
      </v-container>
    </v-list-group>
  </v-list>
</template>

<script>
import { DateTime } from 'luxon'
import { mapState } from 'vuex'

import {
  FETCH_CENTER_REQUEST,
  FETCH_DATES_REQUEST,
  SELECT_DAY,
  SHOW_ERROR,
} from '@/store'
import { getFrenchLuxon } from '@/util/frenchDateTime'

export default {
  props: {
    initialTimeSlots: {
      type: Array,
      default () {},
    },
  },

  data () {
    return {
      timeSlots: this.initialTimeSlots,
      memoDay: undefined,
    }
  },

  computed: {
    ...mapState(['center']),
  },

  watch: {
    $route (to, from) {
      const activeDay = to.params.day
      if (this.memoDay && activeDay !== this.memoDay) {
        this.displayDay(activeDay)
      }
    },

    initialTimeSlots (newData, oldData) {
      const activeTimeSlot = oldData.find(timeSlot => timeSlot.active)
      this.timeSlots = newData.map(timeSlot => ({
        ...timeSlot,
        active: timeSlot && activeTimeSlot ? timeSlot.label === activeTimeSlot.label : false,
      }))
      this.checkDayToDisplay()
    },
  },

  async mounted () {
    await this.getTimeSlots()
    this.checkDayToDisplay()
  },

  methods: {
    async getTimeSlots () {
      const {
        center: nom,
        departement,
      } = this.$route.params
      const selected = this.center.selected
      if (!selected) {
        await this.$store.dispatch(FETCH_CENTER_REQUEST, { nom, departement })
        this.getTimeSlots()
        return
      }
      await this.$store.dispatch(FETCH_DATES_REQUEST, { geoDepartement: selected.geoDepartement, nomCentre: selected.nom })
    },

    checkDayToDisplay () {
      const activeDay = this.$route.params.day
      if (activeDay) {
        this.displayDay(activeDay)
      }
    },

    displayDay (day) {
      this.memoDay = day
      this.timeSlots = this.initialTimeSlots
        .map(timeSlot => ({
          ...timeSlot,
          active: timeSlot.label === day,
        }))
    },

    gotoDay (day) {
      if (day === this.memoDay) {
        this.$router.push({ name: 'time-slot', params: { month: this.$route.params.month, day: 'undefinedDay' } })
        this.memoDay = undefined
        return
      }
      this.memoDay = day
      this.$router.push({ name: 'time-slot-day', params: { day } })
    },

    async selectSlot (slot) {
      if (!this.$store.state.center.selected) {
        return
      }

      const { nom, geoDepartement, _id } = this.$store.state.center.selected
      const day = slot.day.split(' ')
      const hour = slot.hour.split('-')[0].split('h')
      // TODO: Optimize this
      const dateFormat = DateTime.fromFormatExplain(`${day[2]} ${day[1]} ${day[3]}`, 'MMMM d yyyy', { locale: 'fr' }).result
      const dateIso = getFrenchLuxon(dateFormat.year, dateFormat.month, dateFormat.day, +hour[0], +hour[1]).toISO()
      const selectedSlot = {
        slot: dateIso,
        centre: {
          id: _id,
          nom,
          geoDepartement,
        },
      }

      try {
        await this.$store.dispatch(SELECT_DAY, selectedSlot)
        if (this.$store.state.timeSlots.selected) {
          this.$router.push({
            name: 'selection-summary',
            params: {
              departement: `${selectedSlot.centre.geoDepartement}`,
              center: `${selectedSlot.centre.nom}`,
              day: this.$route.params.day,
              slot: selectedSlot.slot,
              modifying: this.$store.state.reservation.isModifying ? 'modification' : 'selection',
            },
          })
        } else {
          throw new Error('Le crennaux n\'est plus disponible')
        }
      } catch (error) {
        this.$router.push({ name: 'time-slot' })
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
</script>
