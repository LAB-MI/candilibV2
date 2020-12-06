<template>
  <div>
    <page-title :title="title" />
    <div class="content">
      <v-dialog
        v-model="dialog"
        max-width="500"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="primary"
            dark
            v-bind="attrs"
            v-on="on"
          >
            Mettre à jour les statuts candilib
          </v-btn>
        </template>
        <v-card>
          <big-loading-indicator :is-loading="isLoading" />
          <v-card-title class="headline">
            {{ title }}
          </v-card-title>
          <v-card-text class="text-center text-2xl pa-16">
            <span>
              Veuillez confirmer la mise à jour
            </span>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="error"
              @click="dialog = false"
            >
              Annuler
            </v-btn>
            <v-spacer />
            <v-btn
              color="success"
              @click="triggerStatusCandilib"
            >
              Confimer
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import { BigLoadingIndicator } from '@/components'
import { mapState } from 'vuex'
import { FETCH_CANDILIB_STATUS_REQUEST } from '@/store'

export default {
  components: {
    BigLoadingIndicator,
  },

  data () {
    return {
      title: 'Mise à jour des statuts candilib',
      dialog: false,
    }
  },

  computed: {
    ...mapState({
      isLoading: state => state.aurige.isFetchingStatusCandilib,
    }),
  },

  methods: {
    triggerStatusCandilib () {
      this.$store.dispatch(FETCH_CANDILIB_STATUS_REQUEST)
      this.dialog = false
    },
  },
}
</script>

<style lang="postcss" scoped>

.content {
  display: flex;
  color: #fff;
  justify-content: center;
  align-items: center;
  padding: 1em 0;
  margin: 0 auto;
  max-width: 1160px;

  @media (max-width: 1169px) {
    flex-direction: column;
  }

  &-action {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 1em;
    margin: 1em;
    flex-grow: 1;

    &--export {
      @media (max-width: 1169px) {
        border-top: 1px solid rgba(200, 200, 200, 0.3);
      }

      @media (min-width: 1170px) {
        border-left: 1px solid rgba(200, 200, 200, 0.3);
      }
    }
  }
}
</style>
