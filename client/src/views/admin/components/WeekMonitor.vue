<template>
  <div>
    <h2 class="title">
      <strong>
        {{ nameCenter }}
      </strong>
    </h2>

    <carousel
      id="carousel"
      class="carousel"
      :navigationEnabled="true"
      :paginationEnabled="false"
      :scrollPerPage="false"
      :perPage="3"
      :perPageCustom="[[768, 5], [1024, 5]]"
      :navigateTo="[currentWeekNumber, false]"
    >
      <slide
        class="slide"
        v-ripple
        v-for="(week, index) in formatArrayByWeek()"
        :key="week.numWeek"
      >
        <v-card
          v-if="index !== 0"
          :id="`week-${nameCenter}-${index}`"
          class="main-card"
          @click="goToGestionPlannings(index, centerId)"
        >
          <v-card-title class="week-card-title">
            {{ `Semaine N°${index}` }}
          </v-card-title>
          <v-card-text class="stats-card">
            <span class="stats-card-text-free-places">
              {{ week.freePlaces || 0 }}
            </span>
            /
            {{ week.totalPlaces || 0 }}
          </v-card-text>
        </v-card>
      </slide>
    </carousel>
  </div>
</template>

<script>
import {
  getFrenchLuxonCurrentDateTime,
  getFrenchWeeksInWeekYear,
} from '@/util'

import { SET_WEEK_SECTION } from '@/store'

export default {
  props: {
    nameCenter: {
      type: String,
      default: '',
    },
    centerId: String,
    weeks: Object,
  },

  computed: {
    currentWeekNumber () {
      return getFrenchLuxonCurrentDateTime().weekNumber
    },
  },

  methods: {
    goToGestionPlannings (currWeek, centerId) {
      this.$store.dispatch(SET_WEEK_SECTION, currWeek, centerId)
      this.$router.push({ name: 'gestion-plannings', params: { centerId } })
    },

    formatArrayByWeek () {
      const weeksInWeekYear = getFrenchWeeksInWeekYear(getFrenchLuxonCurrentDateTime().year)
      const allWeeks = Array(weeksInWeekYear).fill(false)
      Object.keys(this.weeks).map(weekNb => {
        allWeeks[weekNb] = {
          days: [ this.weeks[weekNb] ],
          numWeek: weekNb,
          totalPlaces: this.weeks[weekNb].length,
          freePlaces: this.weeks[weekNb].length - this.weeks[weekNb].filter(elmt => elmt.candidat).length,
        }
      })
      return allWeeks
    },
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

.carousel {
  border: 1px solid black;
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
