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
      v-if="queueStep"
      :step="queueStep"
      :style="{ cursor: 'pointer' }"
      @click="candidatStepper = queueStep"
    >
      <span>
        {{ $formatMessage({ id: 'stepper_queue_step_title' }) }}
      </span>
      <small>
        {{ $formatMessage({ id: 'stepper_queue_step_subtitle' }, { lineDelay }) }}
      </small>
    </v-stepper-step>
    <v-stepper-content
      v-if="queueStep"
      :step="queueStep"
    >
      <p>
        {{ $formatMessage({ id: 'stepper_queue_step_p' }) }}
      </p>
    </v-stepper-content>

    <v-stepper-step
      :step="lastStep"
      :style="{ cursor: 'pointer' }"
      @click="candidatStepper = lastStep"
    >
      <span>
        {{ $formatMessage({ id: 'stepper_step_5_title' }) }}
      </span>
      <small>
        {{ $formatMessage({ id: 'stepper_step_5_subtitle' }) }}
      </small>
    </v-stepper-step>
    <v-stepper-content
      :step="lastStep"
    >
      <p>
        {{ $formatMessage({ id: 'stepper_step_5_p' }) }}
      </p>
    </v-stepper-content>
  </v-stepper>
</template>

<script>
import { FETCH_CONFIG_REQUEST } from '@/store'

export default {
  data () {
    return {
      candidatStepper: this.candidatStep || 0,
    }
  },

  computed: {
    lastStep () {
      return this.queueStep ? 5 : 4
    },

    lineDelay () {
      return this.$store.state.config.lineDelay
    },

    queueStep () {
      return this.lineDelay ? 4 : 0
    },
  },

  mounted () {
    this.$store.dispatch(FETCH_CONFIG_REQUEST)
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
