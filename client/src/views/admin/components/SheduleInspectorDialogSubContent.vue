<template>
  <v-flex xs12>
    <v-alert
      :value="true"
      :color="colorAlert || 'white'"
    >
      <v-layout>
        <v-flex xs5>
          <v-btn
            fab
            :color="colorSubmitButton"
            @click="submitDial"
            large
            ripple
            style="width: 5em; height: 5em;"
            :loading="isLoading"
          >
            <v-icon :color="colorIcon" x-large>
              {{ icon }}
            </v-icon>
          </v-btn>
        </v-flex>
        <v-spacer></v-spacer>
        <v-flex xs12>
          <h1 class="black--text">
            {{ textContent }}
          </h1>
        </v-flex>
      </v-layout>
    </v-alert>
  </v-flex>
</template>

<script>
export default {
  props: {
    textContent: String,
    textButtonCancel: String,
    closeDialog: Function,
    submitDialog: Function,
    content: Object,
    icon: String,
    colorIcon: String,
    colorSubmitButton: String,
    colorAlert: String,
  },
  computed: {
    isLoading () {
      return this.$store.state.admin.placesByCentre.isFetching
    },
  },

  methods: {
    submitDial () {
      this.submitDialog()
    },
  },
}
</script>
