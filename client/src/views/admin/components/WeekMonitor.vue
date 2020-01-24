<template>
  <div style="margin-top: -6em;">
    <h2 class="title">
      <strong>
        <span class="u-uppercase">
          {{ nameCenter }}
        </span>
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
      {{ $formatMessage({ id: 'total_places'}) }}
    </div>

    <data-table-week-monitor
      :items="formattedArrayByWeek"
      :center-id="centerId"
      @goToGestionPlannings="goToGestionPlannings"
    />
  </div>
</template>

<script>
import {
  creneauAvailable,
  getFrenchFormattedDateFromObject,
  getFrenchLuxonCurrentDateTime,
  getFrenchLuxonFromIso,
  validDays,
} from '@/util'

import DataTableWeekMonitor from './DataTableWeekMonitor'

import {
  SET_WEEK_SECTION,
  numberOfMonthsToFetch,
} from '@/store'

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
    centerId: {
      type: String,
      default: '',
    },
    weeks: {
      type: Object,
      default () {},
    },
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

    goToGestionPlannings (currentWeek, weekDay, year) {
      this.$store.dispatch(SET_WEEK_SECTION, currentWeek)
      const date = getFrenchLuxonCurrentDateTime().set({ weekYear: year, weekNumber: currentWeek, weekday: weekDay || 1 }).toSQLDate()
      this.$router.push({ name: 'gestion-planning', params: { center: this.centerId, date } })
    },

    getCreneauTimeAvailable (date) {
      const hour = getFrenchLuxonFromIso(date).toLocaleString({
        hour: '2-digit',
        minute: '2-digit',
      })
      return creneauAvailable.includes(hour)
    },

    getWeeksWithPlaces (weekNb) {
      const filteredWeeks = (this.weeks && this.weeks[weekNb] && this.weeks[weekNb].length)
        ? this.weeks[weekNb].filter(elmt => this.getCreneauTimeAvailable(elmt.date)) : []
      return filteredWeeks
    },

    formatArrayByWeek () {
      let allBookedPlacesByCenter = 0
      let allCenterPlaces = 0

      const start = getFrenchLuxonCurrentDateTime()
      const end = getFrenchLuxonCurrentDateTime().plus({ month: numberOfMonthsToFetch })
      const allWeeks = Math.round(end.diff(start, ['weeks']).weeks) + 1

      const normalizedArray =
        Array.from({ length: allWeeks }).reduce((acc, item, index) => {
          const defaultDays = Array(validDays.length).fill([])
          const [year, week] = start.plus({ weeks: index }).toISOWeekDate().split('-')
          const key = `${year}-${week}`
          const placesOfWeek = this.getWeeksWithPlaces(key)
          if (placesOfWeek && placesOfWeek.length) {
            const totalPlaces = placesOfWeek.length
            const bookedPlaces = placesOfWeek.filter(elmt => elmt.candidat).length
            allBookedPlacesByCenter += bookedPlaces
            allCenterPlaces += totalPlaces
            return [
              ...acc,
              {
                weekKey: key,
                days: placesOfWeek.reduce((prev, day) => splitWeek(prev, day, this.centerId), defaultDays),
                numWeek: week.split('W')[1],
                numYear: year,
                totalPlaces,
                bookedPlaces,
              },
            ]
          }
          return [
            ...acc,
            {
              weekKey: key,
              days: defaultDays,
              numWeek: week.split('W')[1],
              numYear: year,
              totalPlaces: 0,
              bookedPlaces: 0,
            },
          ]
        }, [])
      this.allBookedPlacesByCenter = allBookedPlacesByCenter
      this.allCenterPlaces = allCenterPlaces
      return normalizedArray
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
