<template>
  <section>
    <div class="text--center">
      <already-signed-up
        btn-class-name="t-already-signed-up-button-top"
        test-class-suffix="top"
      />
      <router-link :to="{ name: 'candidat-presignup' }">
        <v-btn color="success">
          Se pré-inscrire
        </v-btn>
      </router-link>
    </div>

    <slot />
    <footer>
      <div class="actions">
        <already-signed-up
          btn-class-name="t-already-signed-up-button-bottom"
          test-class-suffix="bottom"
        />
        <router-link :to="{ name: 'candidat-presignup' }">
          <v-btn color="success">
            Se pré-inscrire
          </v-btn>
        </router-link>

        <router-link
          :to="{ name: 'faq' }"
          class="t-faq"
        >
          <v-btn
            text
            color="#fff"
            tag="a"
            :to="{ name: 'faq' }"
            tabindex="10"
          >
            Une Question ?
          </v-btn>
        </router-link>

        <router-link
          :to="{ name: 'mentions-legales' }"
          class="t-mentions-legales"
        >
          <v-btn
            text
            color="#fff"
            tag="a"
            :to="{ name: 'mentions-legales' }"
            tabindex="9"
          >
            Mentions Légales
          </v-btn>
        </router-link>
      </div>
    </footer>
  </section>
</template>

<script>
import AlreadySignedUp from './AlreadySignedUp'

export default {
  components: {
    AlreadySignedUp,
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
