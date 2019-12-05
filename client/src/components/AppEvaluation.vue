<template>
  <v-dialog
    v-model="showEvaluation"
    max-width="310"
  >
    <v-card
      class="t-evaluation elevation-12 mx-auto"
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
        <v-textarea
          v-model="comment"
          class="no-resize"
          cols="30"
          rows="10"
          :label="leaveAComment"
          :aria-label="leaveAComment"
        />
      </v-card-text>
      <v-divider />
      <v-card-actions class="justify-space-between">
        <v-btn
          text
          class="t-evaluation-later"
          @click="showEvaluation = false"
        >
          {{ $formatMessage({ id: 'later' }) }}
        </v-btn>
        <v-btn
          color="primary"
          text
          class="t-evaluation-submit"
          @click="sendEvaluation"
        >
          {{ $formatMessage({ id: 'evaluate_now' }) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { SET_SHOW_EVALUATION, SEND_EVALUATION_REQUEST } from '@/store'

export default {
  data () {
    return {
      rating: 4,
      comment: '',
      leaveAComment: this.$formatMessage({ id: 'leave_a_comment' }),
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

  methods: {
    sendEvaluation () {
      const evaluation = { rating: this.rating, comment: this.comment }
      this.$store.dispatch(SEND_EVALUATION_REQUEST, evaluation)
    },
  },
}
</script>

<style lang="stylus" scoped>
.no-resize {
  resize: none;
}
</style>
