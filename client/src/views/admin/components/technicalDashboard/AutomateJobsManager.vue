<template>
  <v-card>
    <v-card-title primary-title>
      Jobs:
    </v-card-title>
    <v-card-text>
      <div>
        <v-data-table
          :headers="headersJobs"
          :items="jobs"
        />
      <!-- :items="getPenalties()"
        hide-default-footer
        class="elevation-1 t-history-penalties" -->
      </div>
    </v-card-text>
  </v-card>
</template>
<script>
import { FETCH_JOBS_AUTOMATE_REQUEST } from '@/store'
import { mapState } from 'vuex'
import cronstrue from 'cronstrue/i18n'
import { getFrenchDateTimeTechFromIso } from '@/util'

export default {
  name: 'AutomateJobsManager',
  data () {
    return {
      headersJobs: [
        { text: 'Nom', value: 'name' },
        { text: 'Modifié par', value: 'lastModifiedBy' },
        { text: 'Interval', value: 'repeatInterval' },
        { text: 'Prochain lancement', value: 'nextRunAt' },
        { text: 'Lancé le ', value: 'lastRunAt' },
        { text: 'Finit le', value: 'lastFinishedAt' },
        { text: 'Vérouillé le', value: 'lockedAt' },
      ],
    }
  },
  computed: {
    ...mapState({
      jobs: state => {
        const list = state.adminAutomate.jobs.list
        return list.map(job => ({
          ...job,
          repeatInterval: cronstrue.toString(job.repeatInterval, { use24HourTimeFormat: true, locale: 'fr' }),
          lastRunAt: getFrenchDateTimeTechFromIso(job.lastRunAt) || '',
          nextRunAt: getFrenchDateTimeTechFromIso(job.nextRunAt) || '',
          lastFinishedAt: getFrenchDateTimeTechFromIso(job.lastFinishedAt) || '',
          lockedAt: getFrenchDateTimeTechFromIso(job.lockedAt) || '',
        }))
      },
      isFetching: state => state.adminAutomate.jobs.isFetching,
    }),
  },
  async mounted () {
    await this.$store.dispatch(FETCH_JOBS_AUTOMATE_REQUEST)
  },

}
</script>
