<template>
  <v-list>
    <v-list-group
      v-for="timeSlot in timeSlots"
      :key="timeSlot.day"
      v-model="timeSlot.active"
      :prepend-icon="timeSlot.action"
      no-action
    >
      <template v-slot:activator>
        <keep-alive>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title
                @click="gotoDay(timeSlot.day)"
              >
                {{ timeSlot.day }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </keep-alive>
      </template>

      <v-container
          class="scroll-y"
      >
        <v-btn
          color="primary"
          v-for="hour in timeSlot.hours"
          :key="hour"
          @click="selectSlot({ hour, day: timeSlot.day })"
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

export default {
  props: {
    initialTimeSlots: Array,
  },

  data () {
    return {
      timeSlots: this.initialTimeSlots,
      memoDay: undefined,
    }
  },

  watch: {
    $route (to, from) {
      const activeDay = to.params.day
      if (activeDay !== this.memoDay) {
        this.displayDay(activeDay)
      }
    },
    initialTimeSlots (newData, oldData) {
      this.timeSlots = newData
      this.checkDayToDisplay()
    },
  },

  async mounted () {
    await this.getTimeSlots()
    this.checkDayToDisplay()
  },

  computed: {
    ...mapState(['center']),
  },

  methods: {
    async getTimeSlots () {
      const selected = this.center.selected
      if (!selected || !selected._id) {
        const { center: nom, departement } = this.$route.params
        await this.$store.dispatch(FETCH_CENTER_REQUEST, { nom, departement })
        this.getTimeSlots()
        return
      }
      await this.$store.dispatch(FETCH_DATES_REQUEST, selected._id)
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
          active: timeSlot.day === day,
        }))
    },

    gotoDay (day) {
      if (day === this.memoDay) {
        this.$router.push({ name: 'time-slot' })
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

      const { nom, departement, _id } = this.$store.state.center.selected
      const day = slot.day.split(' ')
      const hour = slot.hour.split('-')[0].split('h')
      const dateFormat = DateTime.fromFormatExplain(`${day[2]} ${day[1]} ${day[3]}`, 'MMMM d yyyy', { locale: 'fr' }).result
      const dateIso = DateTime.local(dateFormat.year, dateFormat.month, dateFormat.day, parseInt(hour[0], 10), parseInt(hour[1], 10)).toISO()
      const selectedSlot = {
        slot: dateIso,
        centre: {
          id: _id,
          nom,
          departement,
        },
      }

      try {
        await this.$store.dispatch(SELECT_DAY, selectedSlot)
        if (this.$store.state.timeSlots.selected) {
          this.$router.push({
            name: 'selection-summary',
            params: {
              departement: `${selectedSlot.centre.departement}`,
              center: `${selectedSlot.centre.nom}`,
              slot: selectedSlot.slot,
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
