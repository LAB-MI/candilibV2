<template>
  <div>
    <v-toolbar :color="colorHeader">
      <v-icon
        color="white"
      >
        {{ iconOnLeft }}
      </v-icon>
      <v-spacer></v-spacer>
      <v-toolbar-title
        class="white--text text-uppercase font-weight-black"
      >
        {{ title }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        style="left: 1em;"
        @click="$emit('close')"
        ripple
        fab
        flat
        :color="colorButton || 'red'"
      >
        <v-icon
          x-large
          :color="colorIcon || 'white'"
        >
          {{ icon || 'highlight_off' }}
        </v-icon>
      </v-btn>
    </v-toolbar>
    <div class=" name-creneau u-flex u-flex--space-between">
      <h4 v-if="nomInspecteur">
        <strong>
          {{ nomInspecteur }}
        </strong>
        {{ formattedDate.length ? 'Le' : '' }}
        <strong>
          {{ formattedDate }}
        </strong>
      </h4>
      <h4 v-if="infoSelectedDialog.place && infoSelectedDialog.place.candidat">
        <strong>
          {{ candidat.prenom }}
          {{ candidat.nomNaissance }}
        </strong>
        <strong>
          {{ candidat.codeNeph }}
        </strong>
      </h4>
    </div>

  </div>
</template>

<script>
import { mapState } from 'vuex'
import {
  getFrenchDateTimeFromIso,
} from '@/util'

export default {
  props: {
    title: String,
    colorIcon: String,
    colorButton: String,
    icon: String,
    colorHeader: String,
    iconOnLeft: String,
    infoSelectedDialog: Object,
  },

  computed: {
    ...mapState({
      candidat: (state) => state.candidats.candidat || {},
    }),
    formattedDate () {
      if (this.infoSelectedDialog.place && this.infoSelectedDialog.place.date) {
        return getFrenchDateTimeFromIso(this.infoSelectedDialog.place.date)
      }
      return ''
    },
    nomInspecteur () {
      if (this.infoSelectedDialog && this.infoSelectedDialog.inspecteurInfos) {
        return this.infoSelectedDialog.inspecteurInfos.nom
      }
      return ''
    },
  },
}
</script>

<style lang="stylus">

.name-creneau {
  margin: 1em;
}

</style>
