<template>
  <div>
    <page-title>
      tech admin dashboard
    </page-title>
    <v-container>
      <v-row dense>
        <v-col cols="12">
          <automate-manager />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import AutomateManager from './AutomateManager.vue'

export default {
  name: 'TechnicalDashboard',
  components: { AutomateManager },
}
</script>
