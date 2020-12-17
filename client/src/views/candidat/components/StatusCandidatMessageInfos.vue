<template>
  <section data-nosnippet="true">
    <v-alert
      type="info"
      class="rounded-corner"
    >
      <p data-nosnippet="true">
        <strong>
          En raison du succès de Candilib, vous êtes de plus en plus nombreux à être en attente d’une
          réservation de place d’examen.
          C’est pourquoi, par souci d’équité, il est mis en place un système d’accès aux places d’examen selon
          l’ancienneté de l’inscription sur Candilib: les places sont mises graduellement en visibilité des
          inscriptions les plus anciennes vers les plus récentes, entre midi et midi cinquante.
        </strong>
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
  name: 'StatusCandidatMessageInfos',
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
