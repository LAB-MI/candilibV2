<template>
  <section data-nosnippet="true">
    <v-alert
      type="error"
      class="rounded-corner"
    >
      <p data-nosnippet="true">
        <strong>COVID-19</strong>: mesures de sécurité sanitaire à respecter
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
        <br>
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

<style scoped>
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
