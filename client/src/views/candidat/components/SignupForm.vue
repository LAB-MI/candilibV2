<template>
  <div>
    <h1 class="login100-form-title">
      CANDILIB
    </h1>
    <h2 class="login50-form-title">
      Réservez votre place d'examen
    </h2>
    <v-form>
      Sign up form
      <v-btn @click="toggleForm">
        Déjà inscrit ?
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
