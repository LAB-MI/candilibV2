<template>
  <layout-landing-page>
    <template v-slot>
      <covid-message-exam />
      <candidat-stepper />
    </template>
  </layout-landing-page>
</template>

<script>
import CovidMessageExam from '@/views/candidat/components/CovidMessageExam'
import CandidatStepper from './CandidatStepper'
import LayoutLandingPage from './LayoutLandingPage'

export default {
  components: {
    LayoutLandingPage,
    CandidatStepper,
    CovidMessageExam,
  },
}
</script>
