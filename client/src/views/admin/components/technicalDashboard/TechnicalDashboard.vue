<template>
  <div>
    <page-title>
      tech admin dashboard
    </page-title>
    <v-container fluid>
      <v-row dense>
        <v-col cols="12">
          <automate-manager />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12">
          <automate-jobs-manager />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import AutomateManager from './AutomateManager.vue'
import AutomateJobsManager from './AutomateJobsManager.vue'

export default {
  name: 'TechnicalDashboard',
  components: { AutomateManager, AutomateJobsManager },
}
</script>
