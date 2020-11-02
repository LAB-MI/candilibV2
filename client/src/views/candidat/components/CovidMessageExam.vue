<template>
  <section data-nosnippet="true">
    <v-alert
      type="error"
      class="rounded-corner"
    >
      <p data-nosnippet="true">
        <strong>COVID-19</strong>: mesures de sécurité sanitaire à respecter pour le passage de l’examen à consulter sur la
        <v-btn
          class="t-faq"
          text
          color="#fff"
          tabindex="10"
          outlined
          @click="$router.push({ name: 'faq'})"
        >
          F.A.Q &nbsp; <v-icon>
            launch
          </v-icon>
        </v-btn>.
        <br><strong>ATTENTION</strong> : si ces conditions ne sont pas respectées, <strong>l’examen n’aura pas lieu</strong> et vous ne pourrez pas réserver une nouvelle place avant 45 jours.
      </p>
    </v-alert>
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
