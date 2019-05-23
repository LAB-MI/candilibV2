<template>
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
      @click="closeDialogHeader"
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
</template>

<script>
export default {
  props: {
    title: String,
    closeDialog: Function,
    colorIcon: String,
    colorButton: String,
    icon: String,
    colorHeader: String,
    iconOnLeft: String,
  },
  methods: {
    closeDialogHeader () {
      this.closeDialog()
    },
  },
}
</script>
