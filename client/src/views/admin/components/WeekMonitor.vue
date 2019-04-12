<template>
  <div>
    <h2>{{ nameCenter }}</h2>
    <carousel
      class="carousel"
      :navigationEnabled="true"
      :paginationEnabled="false"
      :scrollPerPage="false"
      perPage="5"
    >
      <slide
        class="slide"
        v-for="item in nbWeeks"
        :key="item.week"
      >
        <v-card>
          <v-card class="week-card">
            <v-card-text>{{ item.week }}</v-card-text>
          </v-card>
          <v-divider/>
          <v-card class="week-stats-card">
            <v-card-text>{{ item.stats }}</v-card-text>
          </v-card>
        </v-card>
      </slide>
    </carousel>
  </div>
</template>

<script>
export default {
  data () {
    return {
      nbWeeks: Array(20).fill(true).map((item, index) => ({ week: 'S' + index, stats: '50%' })),
    }
  },

  props: {
    nameCenter: String,
  },
}
</script>

<style lang="postcss" scoped>
.carousel {
  border: 1px solid black;
}
.slide {
  height: 8em;
}
.week-card {
  height: 4em;
  color: red;
}
.week-stats-card {
  height: 4em;
  color: green;
}
</style>
