<template>
  <layout-landing-page>
    <div>
      <status-candidat-message-infos />
      <message-prevent-scam />
      <covid-message-exam />
    </div>
    <candidat-stepper />
  </layout-landing-page>
</template>

<script>
import CovidMessageExam from '@/views/candidat/components/CovidMessageExam'
import StatusCandidatMessageInfos from '@/views/candidat/components/StatusCandidatMessageInfos'
import MessagePreventScam from '@/views/candidat/components/MessagePreventScam'
import CandidatStepper from './CandidatStepper'
import LayoutLandingPage from './LayoutLandingPage'

export default {
  components: {
    LayoutLandingPage,
    CandidatStepper,
    CovidMessageExam,
    StatusCandidatMessageInfos,
    MessagePreventScam,
  },
}
</script>
