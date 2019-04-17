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
        <v-card :id="`week-${nameCenter}-${index}`" class="main-card" @click="goToGestionPlannings">
          <div class="week-card">
            <v-card-text>S{{ index }}</v-card-text>
          </div>
          <v-divider/>
          <div class="stats-card">
            <v-card-text class="stats-card-text">
                {{ week.freePlaces || 0 }} / {{ week.totalPlaces || 0 }}
            </v-card-text>
          </div>
        </v-card>
      </slide>
    </carousel>
  </div>
</template>

<script>
import { DateTime } from 'luxon'

export default {
  props: {
    nameCenter: {
      type: String,
      default: '',
    },
    weeks: {
      type: Object,
      default () {
        return {}
      },
    },
  },

  computed: {
    currentWeekNumber () {
      return DateTime.local().setLocale('fr').weekNumber
    },
  },

  methods: {
    goToGestionPlannings () {
      this.$router.push({ name: 'gestion-plannings' })
    },

    formatArrayByWeek () {
      const allWeeks = Array(53).fill(false)
      Object.keys(this.weeks).map(item => {
        allWeeks[item] = {
          days: [ ...this.weeks[item] ],
          numWeek: item,
          totalPlaces: this.weeks[item].length,
          freePlaces: this.weeks[item].length - this.weeks[item].filter(elmt => elmt.candidat).length,
        }
      })
      return allWeeks
    },
  },
}
</script>

<style lang="postcss" scoped>
.main-card {
  cursor: pointer;
  border: 1px solid black
}
.carousel {
  border: 1px hidden;
}
.slide {
  height: 100%;
  text-align: center;
}
.week-card {
  background-color: rgb(199, 199, 199);
  color: black;
}
.stats-card {
  background-color: rgb(114, 114, 114);
  color: black;
}
.stats-card-text {
  height: 4em;
}
.title {
  padding: 1em;
  text-align: center;
  color: black;
}
</style>
