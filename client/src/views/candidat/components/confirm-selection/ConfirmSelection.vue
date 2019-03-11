<template>
  <v-container>
    <section>
      <header class="candidat-section-header">
        <h2 class="candidat-section-header__title" v-ripple @click="goToSelectTimeSlot">
          <v-btn icon>
            <v-icon>arrow_back_ios</v-icon>
          </v-btn>
          Confirmation
        </h2>
      </header>
    </section>

    <v-card>
      <div class="text--center">
        <h3 style="padding: 1em;">
          Madame, Monsieur
          {{ candidat.me ? candidat.me.nomNaissance : '' }}
          {{ candidat.me ? candidat.me.prenom : '' }}
        </h3>

        <p>Vous avez choisi de passer l’épreuve pratique du permis à</p>
        <p>
          <strong>
            <h1>{{ center.selected ? center.selected.nom : '' }}</h1>
          </strong>
        </p>
        <p>
          <strong>{{ center.selected ? center.selected.adresse : '' }}</strong>
        </p>
        <p>
          <strong>Le</strong>
        </p>
        <p>
          <strong>{{ timeSlots.selected ? this.convertIsoDate(timeSlots.selected.slot) : '' }}</strong>
        </p>
      </div>

      <div class="text--center">
        <p>
          <strong>Avez-vous pensez à vérifier :</strong>
        </p>
      </div>
      <v-card-actions>
        <v-form
          class="u-full-width"
          :aria-disabled="disabled"
          :disabled="disabled"
          @submit.prevent="confirmReservation"
        >
          <v-checkbox
            v-model="selectedCheckBox"
            label="qu’une personne peu vous accompagner *"
            value="companion"
          ></v-checkbox>
          <v-checkbox
            v-model="selectedCheckBox"
            label="qu’une voiture à double commande est disponible *"
            value="doubleControlCar"
          ></v-checkbox>

          <v-flex d-flex>
            <v-spacer></v-spacer>
            <v-btn
              outline
              color="red"
              @click="goToSelectTimeSlot()"
            >
              Annuler
            </v-btn>
            <v-btn
              :aria-disabled="disabled"
              :disabled="disabled"
              type="submit"
              color="primary"
            >
              Confirmer
            </v-btn>
          </v-flex>
        </v-form>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { DateTime } from 'luxon'
import { mapState } from 'vuex'

import {
  FETCH_CENTER_REQUEST,
  SHOW_ERROR,
  SELECT_DAY,
  CONFIRM_SELECT_DAY_REQUEST,
} from '@/store'

export default {
  data () {
    return {
      selectedCheckBox: [],
    }
  },

  computed: {
    ...mapState(['center', 'timeSlots', 'candidat']),
    disabled () {
      return this.selectedCheckBox.length !== 2
    },
  },

  methods: {
    goToSelectTimeSlot () {
      this.$router.back()
    },

    async confirmReservation () {
      const selected = {
        ...this.timeSlots.selected,
        isAccompanied: true,
        hasDualControlCar: true,
      }
      try {
        await this.$store.dispatch(CONFIRM_SELECT_DAY_REQUEST, selected)
      } catch (error) {
        await this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },

    convertIsoDate (dateIso) {
      return `${DateTime.fromISO(dateIso).toLocaleString({
        weekday: 'long',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })}`
    },

    async getSelectedCenterAndDate () {
      const {
        center: nom,
        departement,
        slot,
      } = this.$route.params
      const selected = this.center.selected

      if (!selected || !selected._id) {
        await this.$store.dispatch(FETCH_CENTER_REQUEST, { nom, departement })
        setTimeout(this.getSelectedCenterAndDate, 100)
        return
      }

      const selectedSlot = {
        slot,
        centre: {
          id: selected._id,
          nom,
          departement,
        },
      }
      this.$store.dispatch(SELECT_DAY, selectedSlot)
    },
  },

  mounted () {
    this.getSelectedCenterAndDate()
  },
}
</script>
