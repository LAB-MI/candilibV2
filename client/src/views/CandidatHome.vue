<template>
  <div>
    <section>
      <header class="candidat-section-header">
        <h2 class="candidat-section-header__title">
          Ma réservation
        </h2>
      </header>
    </section>
    <router-link :to="{name: 'selection-centre'}">
      <v-btn>Sélectionner un centre</v-btn>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'candidat-home',
  mounted () {
    this.$router.replace({ name: 'candidat-presignup' })
  },
}
</script>
