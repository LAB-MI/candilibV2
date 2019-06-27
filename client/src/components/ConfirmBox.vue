<template>
  <div class= "test">
    <div
      class="u-full-width  u-flex  u-flex--column  u-flex--center"
    >
      <slot/>
      <div d-flex>
        <v-btn
          outline
          color="info"
          @click="closeAction"
        >
          <v-icon>
            arrow_back_ios
          </v-icon>
          Retour
        </v-btn>
        <v-btn
          color="success"
          @click="submitAction"
        >
          Valider
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    closeAction: Function,
    submitAction: Function,
  },
}
</script>

<style lang="stylus">

.test {
  margin: 1em;
}

</style>
