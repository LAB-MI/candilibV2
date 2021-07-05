<template>
  <div>
    <candidat-last-connections />
    <candidat-count-by-status />
    <candidat-logs-monitor />
  </div>
</template>

<script>
import CandidatLogsMonitor from './CandidatLogsMonitor.vue'
import CandidatCountByStatus from './CandidatCountByStatus.vue'
import CandidatLastConnections from './CandidatLastConnections.vue'

export default {
  name: 'AdminTech',
  components: {
    CandidatLogsMonitor,
    CandidatCountByStatus,
    CandidatLastConnections,
  },
}
</script>
