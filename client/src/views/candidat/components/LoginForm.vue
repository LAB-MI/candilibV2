<template>
  <div>
    <h1 class="login100-form-title">
      CANDILIB
    </h1>
    <h2 class="login50-form-title">
      Réservez votre place d'examen
    </h2>
    <v-form>
      Login form
      <v-btn @click="toggleForm">
        Pas encore inscrit ?
      </v-btn>
    </v-form>
  </div>
</template>

<script>
export default {
  props: {
    toggleForm: Function,
  },
}
</script>
