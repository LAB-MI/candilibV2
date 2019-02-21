<template>
  <section>
    <header>
      <h3 class="text--center">
        Les étapes
      </h3>
    </header>
    <candidat-stepper />
    <footer>
        <v-btn color="primary">
          Se pré-inscrire
        </v-btn>
    </footer>
  </section>
</template>

<script>
import CandidatStepper from './CandidatStepper'

export default {
  components: {
    CandidatStepper,
  },
}
</script>
