<template>
  <v-card class="u-flex  u-flex--column  u-flex--center">
    <v-btn icon color="primary" @click="scrollUp">
      <v-icon>
        keyboard_arrow_up
      </v-icon>
    </v-btn>

    <div class="sticky-container" :id="`table-container-${centerId}`" @scroll="onScroll">
      <table>
        <thead>
          <tr>
            <th
              v-for="validDay in headers"
              :key="validDay.text"
              style="text-transform: uppercase;"
            >
              {{ validDay.text }}
            </th>
          </tr>
        </thead>

        <tbody
          ref="tableBody"
        >
          <tr
            v-for="(week, index) in items"
            :key="week.numWeek"
            :id="`week-position-${index}-${centerId}`"
            :class="`${currentWeekNumber === week.numWeek ? 'blue lighten-4' : 'blue-grey lighten-5'}`"
          >
            <th :class="`th-ui-week-column ${setColorTh(week)}`">
              <v-layout row>
                <v-tooltip bottom lazy>
                  <template v-slot:activator="{ on }">
                    <div>
                      <strong v-on="on">{{ getStartOfWeek(week.numWeek, week.numYear) }}</strong>
                    </div>
                  </template>
                  <span>{{ $formatMessage({ id: 'date_first_day_of_week' }) }} {{ week.numWeek }} ({{ week.numYear }})</span>
                </v-tooltip>

                <v-divider vertical style="margin: 0 1em;"></v-divider>

                <v-tooltip bottom lazy>
                  <template v-slot:activator="{ on }">
                    <div v-on="on">
                      <strong>
                        {{ week.bookedPlaces }}
                      </strong>
                      &nbsp;
                      <strong>
                        /
                      </strong>
                      &nbsp;
                      <strong>
                        {{ week.totalPlaces }}
                      </strong>
                    </div>
                  </template>
                  <span>{{ $formatMessage({ id: 'total_of_week' }) }}</span>
                </v-tooltip>
              </v-layout>
            </th>
            <td
              v-for="(day, idx) in week.days"
              :key="`week-${day.numWeek}-day-${idx}`"
            >
              <v-btn @click="goToGestionPlannings(week.numWeek, idx + 1, week.numYear)">
                <span class="text-free-places">
                  <strong>{{ getCountBookedPlaces(day) }}</strong>
                </span>
                &nbsp;
                <strong>
                  /
                </strong>
                &nbsp;
                <span>
                  <strong>
                    {{ day.length }}
                  </strong>
                </span>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <v-btn
      icon
      color="primary"
      @click="scrollDown"
    >
      <v-icon>
        keyboard_arrow_down
      </v-icon>
    </v-btn>
  </v-card>
</template>

<script>
import { scroller } from 'vue-scrollto/src/scrollTo'
import { numberOfMonthsToFetch } from '@/store'
import {
  getFrenchFormattedDateFromObject,
  getFrenchLuxonCurrentDateTime,
  getFrenchWeeksInWeekYear,
  validDays,
} from '@/util'

export default {
  props: {
    items: Array,
    validDays: Array,
    centerId: String,
  },

  data () {
    return {
      currentSelectedWeek: 0,
      scrollTo: scroller(),
      headers: [
        {
          text: 'Semaine du',
          align: 'left',
          sortable: false,
          width: '50',
        },
        ...validDays.map(el => ({ text: el, align: 'center', sortable: false })),
      ],
    }
  },

  computed: {
    activeDepartement () {
      return this.$store.state.admin.departements.active
    },

    currentWeekNumber () {
      const tmp = getFrenchLuxonCurrentDateTime().toISOWeekDate().split('-')
      const currWeekNb = `${tmp[1].replace('W', '')}`
      return currWeekNb
    },

    currentWeekPlusNumberOfMonthsToFetch () {
      return getFrenchLuxonCurrentDateTime().plus({
        month: numberOfMonthsToFetch,
      }).weekNumber
    },

    standardDeviation () {
      const start = getFrenchLuxonCurrentDateTime()
      const end = getFrenchLuxonCurrentDateTime().plus({ month: numberOfMonthsToFetch })
      const allWeeks = Math.round(end.diff(start, ['weeks']).weeks)
      return allWeeks - 3
    },

    getWeeksInWeekYear () {
      return getFrenchWeeksInWeekYear(getFrenchLuxonCurrentDateTime().year - 1)
    },

    scrollOptions () {
      if (this.centerId) {
        return {
          container: `#table-container-${this.centerId}`,
          force: true,
          cancelable: true,
          x: false,
          y: true,
          offset: -36,
          easing: 'ease-in',
          duration: 500,
        }
      }
      return {}
    },
  },

  watch: {
    items: {
      immediate: true,
      deep: true,
      handler (newValue) {
        this.currentSelectedWeek = 0
        setTimeout(this.scrollToSelectedWeek.bind(this), 0)
      },
    },
  },

  methods: {
    getStartOfWeek (weekNumber, weekYear) {
      const shape = {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }
      return getFrenchFormattedDateFromObject(
        { weekYear: weekYear, weekNumber, weekday: 1 },
        shape
      )
    },

    goToGestionPlannings (weekNumber, idx, year) {
      this.$emit('goToGestionPlannings', weekNumber, idx, year)
    },

    getCountBookedPlaces (places) {
      const bookedPlacesCount = places.filter(elmt => elmt.candidat).length
      return bookedPlacesCount
    },

    onScroll (event) {
      const tableRowHeigth = this.$refs.tableBody.firstChild.clientHeight
      this.currentSelectedWeek = Math.floor(
        event.target.scrollTop / tableRowHeigth
      )
    },

    setColorTh (week) {
      const { totalPlaces, bookedPlaces } = week
      if (totalPlaces && totalPlaces !== bookedPlaces && bookedPlaces >= (totalPlaces / 2)) {
        return 'orange darken-1'
      }
      if (totalPlaces && totalPlaces === bookedPlaces) {
        return 'green lighten-2'
      }
      if (totalPlaces) {
        return 'red lighten-1'
      }
      return ''
    },

    scrollUp () {
      this.currentSelectedWeek =
        this.currentSelectedWeek > 0
          ? this.currentSelectedWeek - 1
          : this.currentSelectedWeek
      this.scrollToSelectedWeek()
    },

    scrollDown () {
      this.currentSelectedWeek =
        this.currentSelectedWeek < this.standardDeviation
          ? this.currentSelectedWeek + 1
          : this.standardDeviation
      this.scrollToSelectedWeek()
    },

    scrollToSelectedWeek () {
      this.scrollTo(`#week-position-${this.currentSelectedWeek}-${this.centerId}`, 1, this.scrollOptions)
    },
  },
}
</script>

<style lang="stylus" scoped>
.text-free-places {
  color: #008000;
}

.th-ui-week-column {
  cursor: help;
  justify-content: center;
  padding-left: 1.5vw;
  font-size: 11px;
  min-width: 10vw;
}

.sticky-container {
  display: flex;
  align-items: flex-start;
  width: 100%;
  height: 18em;
  padding: 0 1em;
  overflow: auto;
}

thead th {
  position: sticky;
  top: 0;
  padding: 0.5em;
  z-index: 1;
  background: white;
}
</style>
