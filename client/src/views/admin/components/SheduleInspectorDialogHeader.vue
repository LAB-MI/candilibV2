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
        @click="closeDialog"
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
    <v-toolbar>
      <v-spacer></v-spacer>
      <v-toolbar-title
        class="black--text text-uppercase"
      >
        Inspecteur <strong>{{ infoSelectedDialog.inspecteurInfos.nom }}</strong> Le
        <strong>{{ formattedDate }}</strong>
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
  </div>
</template>

<script>
import {
  getFrenchDateTimeFromIso,
} from '@/util'

export default {
  props: {
    title: String,
    closeDialog: Function,
    colorIcon: String,
    colorButton: String,
    icon: String,
    colorHeader: String,
    iconOnLeft: String,
    infoSelectedDialog: Object,
  },
  computed: {
    formattedDate () {
      if (this.infoSelectedDialog.place && this.infoSelectedDialog.place.date) {
        return getFrenchDateTimeFromIso(this.infoSelectedDialog.place.date)
      }
      return ''
    },
  },
  methods: {
    closeDialogHeader () {
      this.closeDialog()
    },
  },
}
</script>
