<template>
  <v-card>
    <page-title title="Confirmation"></page-title>
    <div
      class="u-full-width  u-flex  u-flex--column  u-flex--center"
    >
      <slot />
      <v-flex d-flex>
        <v-spacer></v-spacer>
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
      </v-flex>
    </div>
  </v-card>
</template>

<script>
import PageTitle from './PageTitle.vue'

export default {
  components: {
    PageTitle,
  },

  props: {
    closeAction: Function,
    submitAction: Function,
  },
}
</script>
