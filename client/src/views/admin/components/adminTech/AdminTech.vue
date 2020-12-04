<template>
  <div>
    <v-card>
      <v-card-title
        primary-title
        class="bg-black"
      >
        <span class="text-white">
          Section 1
        </span>
        <v-spacer />
        <v-btn
          color="primary"
          @click="getLogs()"
        >
          Rafrechir
        </v-btn>
      </v-card-title>
      <big-loading-indicator :is-loading="isFetchingList" />

      <div
        v-for="range in logsList"
        :key="`${range.begin}_${range.end}`"
        class="pa-2 flex-wrap bg-black"
      >
        <v-card-title>
          <span class="text-white">
            {{ `De ${range.begin} à ${range.end}` }}
          </span>
        </v-card-title>
        <v-card
          v-for="departementLogs in range.departements"

          :key="departementLogs.departement"
          class="pa-4 flex"
        >
          <v-card-title
            primary-title
            class="mr-5"
          >
            {{ departementLogs.departement }}
          </v-card-title>
          <v-card
            v-for="item in departementLogs.statusesInfo"
            :key="item.status"
          >
            <v-card-title primary-title>
              Statut {{ Number(item.status) + 1 }}
            </v-card-title>
            <v-card-text>
              Réservation: {{ item.logsContent['PATCH_/places_200'] || 0 }}
            </v-card-text>
            <v-card-text>
              Modification: {{ item.logsContent['PATCH_/places_200_MODIFICATION'] || 0 }}
            </v-card-text>
            <v-card-text>
              Annulation: {{ item.logsContent['DELETE_/places_200'] || 0 }}
            </v-card-text>
          </v-card>
        </v-card>
      </div>
    </v-card>

    <v-card>
      <v-btn
        color="primary"
        @click="getLogs()"
      >
        NOMBRE 2
      </v-btn>
    </v-card>
  </div>
</template>

<script>
import { FETCH_LOGS_REQUEST } from '@/store'
import { mapState } from 'vuex'
import { BigLoadingIndicator } from '@/components'

export default {
  name: 'AdminTech',
  components: {
    BigLoadingIndicator,
  },
  computed: {
    ...mapState(['adminTech']),
    logsList: state => state.adminTech.list,
    isFetchingList: state => state.adminTech.isFetching,

  },
  beforeMount () {
    this.$store.dispatch(FETCH_LOGS_REQUEST)
  },
  methods: {
    getLogs () {
      this.$store.dispatch(FETCH_LOGS_REQUEST)
    },
  },
}
</script>
