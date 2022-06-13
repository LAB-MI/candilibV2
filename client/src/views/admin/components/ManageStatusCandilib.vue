<template>
  <div>
    <page-title :title="title" />
    <div class="content">
      <v-dialog
        v-model="dialog"
        max-width="500"
      >
        <template #activator="{ on, attrs }">
          <div>
            <p>
              <strong class="label">Nombre jours d'inactivité: </strong>
              <span
                class="font-bold"
              >
                {{ nbDaysInactive }}
              </span>
            </p>
            <v-btn
              color="primary"
              dark
              v-bind="attrs"
              v-on="on"
              @click="initNbDays"
            >
              Mettre à jour les statuts candilib
            </v-btn>
          </div>
        </template>
        <v-card>
          <big-loading-indicator :is-loading="isLoading" />
          <v-card-title class="headline">
            {{ title }}
          </v-card-title>
          <v-card-text class="text-center text-2xl pa-16">
            <p class="mb-10">
              <v-icon>warning</v-icon>
              <span> Le nombre doit être supérieur ou égale 60 jours</span>
            </p>
            <p>
              <strong class="label">Nombre jours d'inactivité: </strong>
              <!-- <span
                class="value"
              >
                {{ nbDaysInactive }}
              </span> -->
              <v-text-field
                v-model="nbDays"
                type="number"
              />
            </p>
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
              Confirmer
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
import { FETCH_AURIGE_NBDAYS_INACTIVE_REQUEST, FETCH_CANDILIB_STATUS_REQUEST } from '@/store'

export default {
  components: {
    BigLoadingIndicator,
  },

  data () {
    return {
      title: 'Mise à jour des statuts candilib',
      dialog: false,
      nbDays: undefined,
    }
  },

  computed: {
    ...mapState({
      isLoading: state => state.aurige.isFetchingStatusCandilib,
      nbDaysInactive: state => state.aurige.nbDaysInactive,
    }),
  },
  async mounted () {
    await this.getNbDaysInactive()
  },

  methods: {
    async triggerStatusCandilib () {
      await this.$store.dispatch(FETCH_CANDILIB_STATUS_REQUEST, this.nbDays)
      this.dialog = false
      await this.getNbDaysInactive()
    },
    async getNbDaysInactive () {
      await this.$store.dispatch(FETCH_AURIGE_NBDAYS_INACTIVE_REQUEST)
    },
    initNbDays () {
      this.nbDays = this.nbDaysInactive
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
        border-top: 1px solid rgba(200, 200, 200, 30%);
      }

      @media (min-width: 1170px) {
        border-left: 1px solid rgba(200, 200, 200, 30%);
      }
    }
  }
}
</style>
