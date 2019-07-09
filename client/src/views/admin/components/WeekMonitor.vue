<template>
  <div style="margin-top: -6em;">
    <h2 class="title">
      <strong>
        {{ nameCenter }}
      </strong>

      (
        <strong class="text-free-places">
        {{ allBookedPlacesByCenter }}
        </strong>
        <strong>
          /
        </strong>
        <strong>
          {{ allCenterPlaces }}
        </strong>
      )
    </h2>

    <div class="text-xs-left">
      <span class="stats-card-text-free-places">
        Places reservées
      </span>
      <span class="slash-wrapper">
        /
      </span>
      Total places
    </div>

    <data-table-week-monitor
      :items="formattedArrayByWeek"
      @goToGestionPlannings="goToGestionPlannings"
      :centerId="centerId"
    />
  </div>
</template>

<script>
import {
  getFrenchLuxonFromIso,
  getFrenchFormattedDateFromObject,
  getFrenchLuxonCurrentDateTime,
  getFrenchWeeksInWeekYear,
  validDays,
} from '@/util'

import DataTableWeekMonitor from './DataTableWeekMonitor'

import { SET_WEEK_SECTION } from '@/store'

export const splitWeek = (prev, day, centerId) => {
  const weekDayNumber = getFrenchLuxonFromIso(day.date).weekday - 1
  if (centerId === day.centre && weekDayNumber < validDays.length) {
    if (!prev[weekDayNumber]) {
      prev[weekDayNumber] = []
    }
    prev[weekDayNumber] = [
      ...prev[weekDayNumber],
      day,
    ]
  }

  return prev
}

export default {
  components: {
    DataTableWeekMonitor,
  },

  props: {
    nameCenter: {
      type: String,
      default: '',
    },
    centerId: String,
    weeks: Object,
  },

  data () {
    return {
      allCenterPlaces: 0,
      allBookedPlacesByCenter: 0,
    }
  },

  computed: {
    currentWeekNumber () {
      return getFrenchLuxonCurrentDateTime().weekNumber
    },
    formattedArrayByWeek () {
      return this.formatArrayByWeek()
    },
  },

  methods: {
    getCountBookedPlaces (places) {
      const bookedPlacesCount = places.filter(elmt => elmt.candidat).length
      return places.length - bookedPlacesCount
    },

    getStartOfWeek (weekNumber) {
      const currentYear = getFrenchLuxonCurrentDateTime().weekYear
      const shape = {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
      }
      return getFrenchFormattedDateFromObject({ weekYear: currentYear, weekNumber, weekday: 1 }, shape)
    },

    goToGestionPlannings (currentWeek, weekDay) {
      this.$store.dispatch(SET_WEEK_SECTION, currentWeek)
      const date = getFrenchLuxonCurrentDateTime().set({ weekNumber: currentWeek, weekday: weekDay || 1 }).toSQLDate()
      this.$router.push({ name: 'gestion-planning', params: { center: this.centerId, date } })
    },

    formatArrayByWeek () {
      this.allBookedPlacesByCenter = 0
      this.allCenterPlaces = 0

      // TODO: Find solution to last month of year for transition
      const weeksInWeekYear = getFrenchWeeksInWeekYear(getFrenchLuxonCurrentDateTime().year)
      const allWeeksOfYear = Array(weeksInWeekYear).fill(false)
      const formattedArray = allWeeksOfYear.map((useless, weekNb) => {
        const defaultDays = Array(validDays.length).fill([])

        const weeksWithPlaces = this.weeks && this.weeks[weekNb]
        if (weeksWithPlaces && weeksWithPlaces.length) {
          const totalPlaces = weeksWithPlaces.length
          const bookedsPlaces = weeksWithPlaces.filter(elmt => elmt.candidat).length
          this.allBookedPlacesByCenter = bookedsPlaces + this.allBookedPlacesByCenter
          this.allCenterPlaces = totalPlaces + this.allCenterPlaces
          return {
            days: weeksWithPlaces.reduce((prev, day) => splitWeek(prev, day, this.centerId), defaultDays),
            numWeek: weekNb,
            totalPlaces,
            bookedsPlaces,
          }
        }
        return {
          days: defaultDays,
          numWeek: weekNb,
          totalPlaces: 0,
          bookedsPlaces: 0,
        }
      })
      return formattedArray.filter(e => e.numWeek !== 0)
    },
  },
}
</script>

<style lang="postcss" scoped>
.title {
  padding: 1em;
  text-align: center;
}

.text-free-places {
  color: green;
}
</style>
