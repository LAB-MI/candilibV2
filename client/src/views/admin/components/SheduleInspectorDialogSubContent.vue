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
          <h1 v-if="activeTextContent" class="black--text">
            {{ textContent }}
            <slot name='title'/>
          </h1>
          <slot/>
        </v-flex>
      </v-layout>
    </v-alert>
  </v-flex>
</template>

<script>
export default {
  props: {
    textContent: String,
    activeTextContent: {
      type: Boolean,
      default: true,
    },
    textButtonCancel: String,
    closeDialog: Function,
    submitDialog: Function,
    content: Object,
    icon: String,
    colorIcon: String,
    colorSubmitButton: String,
    colorAlert: String,
    isLoading: {
      type: Boolean,
      default: false,
    },
    activeTextContent: {
      type: Boolean,
      default: true,
    },
  },

  methods: {
    submitDial () {
      this.submitDialog()
    },
  },
}
</script>
