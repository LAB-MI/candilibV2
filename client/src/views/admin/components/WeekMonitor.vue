<template>
  <div>
    <h2 class="title">
      <strong>
        {{ nameCenter }}
      </strong>
    </h2>
    <carousel
      class="carousel"
      :navigationEnabled="true"
      :paginationEnabled="false"
      :scrollPerPage="false"
      :perPage="5"
    >
      <slide
        class="slide"
        v-ripple
        v-for="item in weeks"
        :key="item.weekNumber"
      >
        <v-card class="main-card" @click="goToGestionPlannings">
          <div class="week-card">
            <v-card-text>{{ item.weekNumber }}</v-card-text>
          </div>
          <v-divider/>
          <div class="stats-card">
            <v-card-text>{{ item.stats }}</v-card-text>
            <v-card-text>Places reservés / Places disponibles</v-card-text>
          </div>
        </v-card>
      </slide>
    </carousel>
  </div>
</template>

<script>
export default {
  props: {
    nameCenter: {
      type: String,
      default: '',
    },
    weeks: {
      type: Array,
      default: [],
    },
  },

  methods: {
    goToGestionPlannings () {
      this.$router.push({ name: 'gestion-plannings' })
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
.title {
  padding: 1em;
  text-align: center;
  color: black;
}
</style>
