<template>
  <div>
    <monitors />
    <v-layout column wrap>
      <div
        class="div-gestion"
        v-for="item in buttonGestion"
        :key="item.title"
      >
        <v-btn @click="goToGestionPlannings">
          <v-icon class="button-icon">
            {{ item.icon }}
          </v-icon>
          <span>
            {{ item.title }}
          </span>
        </v-btn>
      </div>
    </v-layout>
    <div class="u-flex  u-flex--center">
    </div>
  </div>
</template>

<script>
import Monitors from './Monitors.vue'
import { FETCH_ADMIN_INFO_REQUEST } from '@/store'

export default {
  components: {
    Monitors,
  },

  data () {
    return {
      buttonGestion: [
        {
          icon: 'calendar_today',
          title: 'Gestion des plannings IPCSR',
        },
        {
          icon: 'list',
          title: 'Gestion des candidats',
        },
      ],
    }
  },

  methods: {
    goToGestionPlannings () {
      this.$router.push({ name: 'gestion-plannings' })
    },
  },

  async mounted () {
    await this.$store.dispatch(FETCH_ADMIN_INFO_REQUEST)
  },
}
</script>

<style lang="postcss" scoped>
.search-input {
  margin: 0 1em;
}
</style>
