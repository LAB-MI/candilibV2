<template>
  <section>
    <div class="text--center">
      <already-signed-up />
      <router-link :to="{ name: 'candidat-presignup' }">
        <v-btn color="success" >
          Se pré-inscrire
        </v-btn>
      </router-link>
    </div>
    <candidat-stepper />
    <footer class="text--center">
      <already-signed-up />
      <router-link :to="{ name: 'candidat-presignup' }">
        <v-btn color="success" >
          Se pré-inscrire
        </v-btn>
      </router-link>
       <router-link :to="{ name: 'candidat-presignup' }">
        <v-btn flat color="#fff" tag="a" :to="{ name: 'faq' }" tabindex="10">
          Une Question ?
        </v-btn>
      </router-link>
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
