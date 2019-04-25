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
      :perPage="5"
      :navigationEnabled="true"
      :paginationEnabled="false"
      :scrollPerPage="false"
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
          v-if="index
          !== 0" :id="`week-${nameCenter}-${index}`"
          class="main-card"
          @click="goToGestionPlannings(index, centerId)"
        >
          <div class="week-card">
            <v-card-text class="week-card-text">
              {{ `Semaine N°${index}` }}
            </v-card-text>
          </div>
          <v-divider/>
          <div class="stats-card">
            <v-card-text class="stats-card-text-free-places">
              {{ week.freePlaces || 0 }}
            </v-card-text> /
            <v-card-text class="stats-card-text-total-places">
              {{ week.totalPlaces || 0 }}
            </v-card-text>

            <v-card-text class="stats-card-text-free-places">
              Disponible
            </v-card-text> /
            <v-card-text class="stats-card-text-total-places">
              Total
            </v-card-text>
          </div>
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
      this.$router.push({ name: 'gestion-plannings' })
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
  border: 4px solid black;
}

.carousel {
  border: 1px hidden black;
}

.slide {
  height: 100%;
  text-align: center;
  zoom: 75%;
}

.week-card {
  background-color: rgb(207, 200, 198);
  color: black;
  height: 100%;
  font-size: 2em;
}

.stats-card {
  background-color: rgb(240, 239, 239);
  color: black;
  height: 100%;
}

.stats-card-text-total-places {
  height: 100%;
  color: blue;
  font-size: 2em;
}

.stats-card-text-free-places {
  height: 100%;
  color: green;
  font-size: 2em;
}
.title {
  padding: 1em;
  text-align: center;
  color: black;
}
</style>
