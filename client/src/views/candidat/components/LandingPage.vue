<template>
  <section>
    <div class="text--center">
      <already-signed-up class="t-already-signed-up-button-top" test-class-suffix="top" />
      <router-link :to="{ name: 'candidat-presignup' }">
        <v-btn color="success" >
          Se pré-inscrire
        </v-btn>
      </router-link>
    </div>
    <candidat-stepper />
    <footer>
      <div class="actions">
        <already-signed-up class="t-already-signed-up-button-bottom" test-class-suffix="bottom" />
        <router-link :to="{ name: 'candidat-presignup' }">
          <v-btn color="success" class="t-presignup-button" >
            Se pré-inscrire
          </v-btn>
        </router-link>

        <router-link :to="{ name: 'faq' }">
          <v-btn  flat color="#fff" tag="a" :to="{ name: 'faq' }" tabindex="10">
            Une Question ?
          </v-btn>
        </router-link>

        <router-link :to="{ name: 'mentions-legales' }">
          <v-btn flat color="#fff" tag="a" :to="{ name: 'mentions-legales' }" tabindex="9">
            Mentions Légales
          </v-btn>
        </router-link>

      </div>
    </footer>
  </section>
</template>

<script>
import CandidatStepper from './CandidatStepper'
import AlreadySignedUp from './AlreadySignedUp'

export default {
  components: {
    AlreadySignedUp,
    CandidatStepper,
  },
}
</script>

<style lang="stylus" scoped>

.actions {
  display: grid;
  justify-content: center;
  grid-template-columns: auto auto;
  justify-items: center;
}
</style>
