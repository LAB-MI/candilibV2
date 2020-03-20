<template>
  <section>
    <div class="text--center">
      <v-alert
        value="true"
        type="info"
        class="rounded-corner"
      >
        <p>
          En raison de la situation de crise pandémique liée au coronavirus COVID 19, les examens du permis de conduire sont suspendus jusqu'à nouvel ordre.
          <br>
          Le site candilib restera indisponible durant cette période.
          <br>Toutes les informations sur
          <a
            class="link-color"
            href="https://www.securite-routiere.gouv.fr"
          >www.securite-routiere.gouv.fr</a>
          <br>Ne vous déplacez pas.
          <br>Toutes les informations sur
          <a
            class="link-color"
            href="https://www.gouvernement.fr"
          >www.gouvernement.fr</a>
        </p>
      </v-alert>
    </div>
    <footer>
      <div class="actions">
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

export default {
  components: {
  },
}
</script>

<style lang="stylus" scoped>
.link-color {
  color: white;
  text-decoration: underline;
}

.actions {
  display: grid;
  justify-content: center;
  grid-template-columns: auto auto;
  justify-items: center;
}
</style>
