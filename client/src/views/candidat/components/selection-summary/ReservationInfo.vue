<template>
  <div>
    <h1 class="text--center">{{ nom }}</h1>
    <p class="text--center">
      {{ adresse }}
      <a
        target="_blank"
        @click.stop="true"
        class="location-icon"
        v-ripple
        :href="`https://www.openstreetmap.org/search?query=${adresse.replace(',', ' ').replace(/FR.*/, '')}`"
      >
        <v-icon>
          location_on
        </v-icon>
      </a>
    <p class="text--center">
        Le
        {{ date }}
    </p>
  </div>
</template>

<script>
export default {
  props: {
    nom: String,
    adresse: String,
    date: String,
  },
}
</script>

<style lang="postcss" scoped>
.location-icon {
  display: inline-block;
  margin-left: 0.5em;
  padding-left: 0.5em;
  border-left: 1px solid grey;
}
</style>
