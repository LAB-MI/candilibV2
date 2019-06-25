<template>
  <div>
    <h2 class="title">
      <strong>
        {{ nameCenter }}
      </strong>
    </h2>
    <v-data-table
      :headers="headers"
      :items="formattedArrayByWeek"
      class="elevation-1"
      :pagination.sync="pagination"
    >
      <template v-slot:items="props">
        <td>
          <span>
            Semaine du {{ getStartOfWeek(props.item.numWeek) }}
          </span>
        </td>
        <td
          v-for="(days, idx) in props.item.days"
          :key="`week-${props.item.numWeek}-day-${idx}`"
        >
          <v-btn
            @click="goToGestionPlannings(props.item.numWeek, idx + 1)"
          >
            <span
              class="text-free-places"
            >
              {{ getCountBookedPlaces(days) }}
            </span>
            /
            <span>
              {{ days.length }}
            </span>
          </v-btn>
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import {
  getFrenchLuxonDateFromIso,
  getFrenchDateFromObject,
  getFrenchLuxonCurrentDateTime,
  getFrenchWeeksInWeekYear,
  validDays,
} from '@/util'

import { SET_WEEK_SECTION } from '@/store'

export const splitWeek = (prev, day, centerId) => {
  const weekDayNumber = getFrenchLuxonDateFromIso(day.date).weekday - 1
  if (centerId === day.centre && weekDayNumber < 5) {
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
      pagination: {},
      headers: [
        {
          text: 'Semaine',
          align: 'center',
          sortable: false,
          width: '50',
        },
        ...validDays.map(el => ({ text: el, align: 'center', sortable: false })),
      ],
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
      return getFrenchDateFromObject({ weekYear: currentYear, weekNumber, weekday: 1 }, shape)
    },

    goToGestionPlannings (currentWeek, weekDay) {
      this.$store.dispatch(SET_WEEK_SECTION, currentWeek)
      const date = getFrenchLuxonCurrentDateTime().set({ weekNumber: currentWeek, weekday: weekDay || 1 }).toSQLDate()
      this.$router.push({ name: 'gestion-planning', params: { center: this.centerId, date } })
    },

    formatArrayByWeek () {
      // TODO: Find solution to last month of year for transition
      const weeksInWeekYear = getFrenchWeeksInWeekYear(getFrenchLuxonCurrentDateTime().year)
      const allWeeksOfYear = Array(weeksInWeekYear).fill(false)
      const formattedArray = allWeeksOfYear.map((useless, weekNb) => {
        const defaultDays = Array(validDays.length).fill([])

        const weeksWithPlaces = this.weeks && this.weeks[weekNb]
        if (weeksWithPlaces && weeksWithPlaces.length) {
          return {
            days: weeksWithPlaces.reduce((prev, day) => splitWeek(prev, day, this.centerId), defaultDays),
            numWeek: weekNb,
            totalPlaces: weeksWithPlaces.length,
            freePlaces: weeksWithPlaces.length - weeksWithPlaces.filter(elmt => elmt.candidat).length,
          }
        }
        return {
          days: defaultDays,
          numWeek: weekNb,
          totalPlaces: 0,
          freePlaces: 0,
        }
      })
      return formattedArray.filter(e => e.numWeek !== 0)
    },
  },

  mounted () {
    this.pagination.page = Math.ceil(this.currentWeekNumber / 5)
  },
}
</script>

<style lang="postcss" scoped>
.main-card {
  height: 100%;
  cursor: pointer;
  border-width: 2px;
  border-style: solid;
  border-color: black;
}

.text-free-places {
  height: 100%;
  color: green;
}

.slide {
  height: 100%;
  text-align: center;
}

.week-card-title {
  background-color: rgb(207, 200, 198);
  height: 100%;
  font-size: 1.5em;
}

.stats-card {
  font-size: 1.5em;
  background-color: rgb(240, 239, 239);
  padding: 0;
}

.stats-card-text-free-places {
  color: green;
}

.title {
  padding: 1em;
  text-align: center;
}
</style>
