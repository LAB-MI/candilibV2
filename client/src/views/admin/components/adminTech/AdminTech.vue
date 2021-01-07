<template>
  <div>
    <candidat-count-by-status />
    <candidat-logs-monitor />
  </div>
</template>

<script>
import CandidatLogsMonitor from './CandidatLogsMonitor.vue'
import CandidatCountByStatus from './CandidatCountByStatus.vue'

export default {
  name: 'AdminTech',
  components: {
    CandidatLogsMonitor,
    CandidatCountByStatus,
  },
}
</script>
