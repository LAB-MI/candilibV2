<template>
  <v-dialog v-model="showEvaluation" max-width="310">
    <v-card
      class="elevation-12 mx-auto"
      width="300"
    >
      <v-card-title
        class="headline"
        primary-title
      >
        Merci de noter Candilib
      </v-card-title>
      <v-card-text>
        <v-rating
          v-model="rating"
          color="yellow darken-3"
          background-color="grey darken-1"
          empty-icon="$vuetify.icons.ratingFull"
          half-increments
          hover
        />
        <textarea name="" id="" cols="30" rows="10"></textarea>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="justify-space-between">
        <v-btn
          flat
          @click="showEvaluation = false"
        >
          Plus tard
        </v-btn>
        <v-btn
          color="primary"
          flat
          @click="showEvaluation = false"
        >
          Noter maintenant
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { SET_SHOW_EVALUATION } from '@/store'

export default {
  data () {
    return {
      rating: 4.5,
    }
  },

  computed: {
    showEvaluation: {
      get () {
        return this.$store.state.candidat.showEvaluation
      },
      set (showEvaluation) {
        this.$store.dispatch(SET_SHOW_EVALUATION, showEvaluation)
      },
    },
  },
}
</script>
