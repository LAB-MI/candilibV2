<template>
  <v-stepper
    v-model="candidatStepper"
    dark
    vertical
    class="stepper"
    @set-stepper="setStepper"
  >
    <header>
      <h3 class="stepper-title">
        Les étapes de la pré-inscription à la réservation
      </h3>
    </header>
    <v-stepper-step
      step="1"
      :style="{ cursor: 'pointer' }"
      @click="candidatStepper = 1"
    >
      <span>
        {{ $formatMessage({ id: 'stepper_step_1_title' }) }}
      </span>
      <small>
        {{ $formatMessage({ id: 'stepper_step_1_subtitle' }) }}
      </small>
    </v-stepper-step>
    <v-stepper-content step="1">
      <p>
        {{ $formatMessage({ id: 'stepper_step_1_p' }) }}
      </p>
    </v-stepper-content>

    <v-stepper-step
      step="2"
      :style="{ cursor: 'pointer' }"
      @click="candidatStepper = 2"
    >
      <span>
        {{ $formatMessage({ id: 'stepper_step_2_title' }) }}
      </span>
      <small>
        {{ $formatMessage({ id: 'stepper_step_2_subtitle' }) }}
      </small>
    </v-stepper-step>
    <v-stepper-content step="2">
      <p>
        {{ $formatMessage({ id: 'stepper_step_2_p' }) }}
      </p>
    </v-stepper-content>

    <v-stepper-step
      step="3"
      :style="{ cursor: 'pointer' }"
      @click="candidatStepper = 3"
    >
      <span>
        {{ $formatMessage({ id: 'stepper_step_3_title' }) }}
      </span>
      <small>
        {{ $formatMessage({ id: 'stepper_step_3_subtitle' }) }}
      </small>
    </v-stepper-step>
    <v-stepper-content step="3">
      <p>
        {{ $formatMessage({ id: 'stepper_step_3_p1' }) }}
      </p>
      <p>
        {{ $formatMessage({ id: 'stepper_step_3_p2' }) }}
      </p>
    </v-stepper-content>

    <v-stepper-step
      step="4"
      :style="{ cursor: 'pointer' }"
      @click="candidatStepper = 4"
    >
      <span>
        {{ $formatMessage({ id: 'stepper_step_4_title' }) }}
      </span>
      <small>
        {{ $formatMessage({ id: 'stepper_step_4_subtitle' }) }}
      </small>
    </v-stepper-step>
    <v-stepper-content step="4">
      <p>
        {{ $formatMessage({ id: 'stepper_step_4_p' }) }}
      </p>
    </v-stepper-content>
  </v-stepper>
</template>

<script>
export default {
  props: {
    candidatStep: {
      type: Number,
      default: 0,
    },
  },
  data () {
    return {
      candidatStepper: this.candidatStep || 0,
    }
  },
  methods: {
    setStepper (step) {
      this.candidatStepper = step
    },
  },
}
</script>

<style lang="stylus" scoped>
.theme--dark.stepper {
  background-color: transparent;
  box-shadow: none;
}

.stepper-title {
  color: #fff;
  font-size: 1.4em;
  text-align: center;
}
</style>
