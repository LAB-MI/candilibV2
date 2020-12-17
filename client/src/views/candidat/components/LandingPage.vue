<template>
  <layout-landing-page>
    <template v-slot>
      <div>
        <status-candidat-message-infos />
        <covid-message-exam />
      </div>
      <candidat-stepper />
    </template>
  </layout-landing-page>
</template>

<script>
import CovidMessageExam from '@/views/candidat/components/CovidMessageExam'
import StatusCandidatMessageInfos from '@/views/candidat/components/StatusCandidatMessageInfos'
import CandidatStepper from './CandidatStepper'
import LayoutLandingPage from './LayoutLandingPage'

export default {
  components: {
    LayoutLandingPage,
    CandidatStepper,
    CovidMessageExam,
    StatusCandidatMessageInfos,
  },
}
</script>
