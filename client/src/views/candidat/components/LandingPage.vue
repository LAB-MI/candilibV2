<template>
  <layout-landing-page>
    <template v-slot>
      <covid-message-presignup-exam />
      <candidat-stepper />
    </template>
  </layout-landing-page>
</template>

<script>
import CovidMessagePresignupExam from '@/views/candidat/components/CovidMessagePresignupExam'
import CandidatStepper from './CandidatStepper'
import LayoutLandingPage from './LayoutLandingPage'

export default {
  components: {
    LayoutLandingPage,
    CandidatStepper,
    CovidMessagePresignupExam,
  },
}
</script>
