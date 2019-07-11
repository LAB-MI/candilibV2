<template>
  <div class="calendar-month">
    <div>
      <h2>{{calendarTitle}}</h2>
    </div>

    <div class="calendar-day" v-for="(day, i) in days" :key="i">
      <span>{{day}}</span>
    </div>
  </div>
</template>

<script>
import { getDataOfTheMonth } from '@/util'

export default {
  props: {
    places: Array,
  },

  data () {
    return {
      month: getDataOfTheMonth(),
      days: [],
      calendarTitle: '',
    }
  },

  mounted () {
    this.updateCalendar()
  },

  methods: {
    updateCalendar () {
      const { daysAfter, daysBefore, daysInMonth, daysInLastMonth } = getDataOfTheMonth()
      this.days = [
        ...Array.from({ length: daysBefore }, (el, i) => daysInLastMonth - i),
        ...Array.from({ length: daysInMonth }, (el, i) => i + 1),
        ...Array.from({ length: daysAfter }, (el, i) => i + 1),
      ]
    },
  },
}
</script>

<style lang="css" scoped>
.calendar-month {
  display: flex;
  flex-wrap: wrap;
  padding: 1em;
}

.calendar-day {
  flex-basis: 14%;
  flex-grow: 1;
  flex-shrink: 0;
  height: 10em;
  border-width: 0 1px 1px 0;
  border-color: #bbb;
  border-style: solid;
}
</style>
