<template>
  <layout-landing-page>
    <template v-slot>
      <candidat-stepper />
    </template>
  </layout-landing-page>
</template>

<script>
import CandidatStepper from './CandidatStepper'
import LayoutLandingPage from './LayoutLandingPage'

export default {
  components: {
    LayoutLandingPage,
    CandidatStepper,
  },
}
</script>
