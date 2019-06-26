<template>
  <v-card class="u-flex  u-flex--column  u-flex--center">
    <v-btn icon color="primary" @click="scrollUp">
      <v-icon>
        keyboard_arrow_up
      </v-icon>
    </v-btn>

    <div
      class="sticky-container"
      :id="`table-container-${centerId}`"
      @scroll="onScroll"
    >
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
            v-for="week in items"
            :key="week.numWeek"
            :id="`week-position-${week.numWeek}-${centerId}`"
            :style="`background-color: ${currentWeek === week.numWeek ? '#bde;' : '#eee;'}`"
          >
            <td>
              <v-chip
                class="chip-ui-week-column"
                :color="setColorChip(week)"
              >
                <v-tooltip bottom lazy>
                  <template v-slot:activator="{ on }">
                    <strong v-on="on">
                      {{ getStartOfWeek(week.numWeek) }}
                    </strong>
                  </template>
                  <span>Date du premiers jour de la semaine N°{{ week.numWeek }}</span>
                </v-tooltip>

                <v-divider vertical style="margin: 0 1em;"></v-divider>

                <v-tooltip bottom lazy>
                  <template v-slot:activator="{ on }">
                    <div v-on="on">
                    <strong>
                      {{ week.bookedsPlaces }}
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
                  <span>Total de la Semaine</span>
                </v-tooltip>
              </v-chip>
            </td>
            <td
              v-for="(day, idx) in week.days"
              :key="`week-${day.numWeek}-day-${idx}`"
            >
              <v-btn
                @click="goToGestionPlannings(week.numWeek, idx + 1)"
              >
                <span
                  class="text-free-places"
                >
                  <strong>
                    {{ getCountBookedPlaces(day) }}
                  </strong>
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
      currentSelectedWeek: getFrenchLuxonCurrentDateTime().weekNumber,
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

    currentWeek () {
      return getFrenchLuxonCurrentDateTime().weekNumber
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
        this.currentSelectedWeek = this.currentWeek
        setTimeout(this.scrollToSelectedWeek.bind(this), 0)
      },
    },
  },

  methods: {
    getStartOfWeek (weekNumber) {
      const currentYear = getFrenchLuxonCurrentDateTime().weekYear
      const shape = {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }
      return getFrenchFormattedDateFromObject({ weekYear: currentYear, weekNumber, weekday: 1 }, shape)
    },

    goToGestionPlannings (weekNumber, idx) {
      this.$emit('goToGestionPlannings', weekNumber, idx)
    },

    getCountBookedPlaces (places) {
      const bookedPlacesCount = places.filter(elmt => elmt.candidat).length
      return bookedPlacesCount
    },

    onScroll (event) {
      const tableRowHeigth = this.$refs.tableBody.firstChild.clientHeight
      this.currentSelectedWeek = Math.floor(event.target.scrollTop / (tableRowHeigth || 48))
    },

    setColorChip (week) {
      const { totalPlaces, bookedsPlaces } = week
      if (totalPlaces && bookedsPlaces >= (totalPlaces / 2)) {
        return 'orange'
      }
      if (totalPlaces && totalPlaces === bookedsPlaces) {
        return 'red'
      }
      if (totalPlaces) {
        return 'success'
      }
      return ''
    },

    scrollUp () {
      this.currentSelectedWeek = Math.max(this.currentSelectedWeek - 1, 1)
      this.scrollToSelectedWeek()
    },

    scrollDown () {
      const weeksInWeekYear = getFrenchWeeksInWeekYear(getFrenchLuxonCurrentDateTime().year - 1)
      this.currentSelectedWeek = Math.min(this.currentSelectedWeek + 1, weeksInWeekYear - 1)
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

.chip-ui-week-column {
  justify-content: center;
  margin-top: 9px;
  font-size: 11px;
  width: 9vw;
}

.chip-ui-total-column {
  justify-content: center;
  margin-top: 9px;
  overflow: scroll;
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
  z-index: 10;
  background: white;
}
</style>
