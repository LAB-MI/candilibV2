<template>
  <v-dialog
    v-model="dialog"
    transition="dialog-transition"
    scrollable
  >
    <template v-slot:activator="{ on }">
      <v-btn
        color="primary"
        v-on="on"
        @click="triggerDialog"
      >
        Détails
      </v-btn>
    </template>
    <v-card>
      <v-card-actions>
        <v-btn
          @click="triggerDialog"
        >
          Fermer
        </v-btn>
      </v-card-actions>
      <v-card>
        <v-expansion-panels
          focusable
          multiple
        >
          <v-expansion-panel
            v-for="logs in listLogs"
            :key="logs.date"
          >
            <v-expansion-panel-header>{{ logs.date }}</v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-tabs>
                <v-tab>
                  National
                </v-tab>
                <v-tab>
                  Par département
                </v-tab>
                <v-tab>
                  Par tranche
                </v-tab>

                <v-tab-item>
                  <v-card
                    class="overflow-scroll  bg-black"
                  >
                    <v-card
                      v-for="item in logs.content.summaryNational"
                      :key="item.status"
                    >
                      <v-card-text>
                        <v-card-title primary-title>
                          {{ groupe }}: {{ Number(item.status) + 1 }}
                        </v-card-title>
                        <v-card-text>
                          {{ reservation }}: {{ item.infos['R'] || 0 }}
                          {{ modification }}: {{ item.infos['M'] || 0 }}
                          {{ annulation }}: {{ item.infos['A'] || 0 }}
                        </v-card-text>
                      </v-card-text>
                    </v-card>
                  </v-card>
                </v-tab-item>

                <v-tab-item>
                  <v-card
                    class="overflow-scroll  bg-black"
                  >
                    <v-card
                      v-for="logItem in logs.content.summaryByDepartement"
                      :key="logItem.dpt"
                      class="flex flex-col"
                    >
                      <v-card-title
                        primary-title
                      >
                        {{ logItem.dpt }}
                      </v-card-title>
                      <v-card-text
                        v-for="statusItem in logItem.content"
                        :key="statusItem.status"
                      >
                        <span>
                          <v-card>
                            <v-card-title primary-title>
                              {{ groupe }}: {{ Number(statusItem.status) + 1 }}
                            </v-card-title>
                            <v-card-text>
                              {{ reservation }}: {{ statusItem.infos['R'] || 0 }}
                              {{ modification }}: {{ statusItem.infos['M'] || 0 }}
                              {{ annulation }}: {{ statusItem.infos['A'] || 0 }}
                            </v-card-text>
                          </v-card>
                        </span>
                      </v-card-text>
                    </v-card>
                  </v-card>
                </v-tab-item>
                <v-tab-item>
                  <v-card>
                    <v-card-text>
                      <div
                        class="overflow-scroll"
                      >
                        <div
                          v-for="range in logs.content.details"
                          :key="`${range.begin}_${range.end}`"
                          class="pa-2 flex-wrap bg-gray-700"
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
                                {{ groupe }}: {{ Number(item.status) + 1 }}
                              </v-card-title>
                              <v-card-text>
                                {{ reservation }}: {{ item.logsContent['R'] || 0 }}
                              </v-card-text>
                              <v-card-text>
                                {{ modification }}: {{ item.logsContent['M'] || 0 }}
                              </v-card-text>
                              <v-card-text>
                                {{ annulation }}: {{ item.logsContent['A'] || 0 }}
                              </v-card-text>
                            </v-card>
                          </v-card>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-tab-item>
              </v-tabs>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  name: 'DetailsDialog',
  props: {
    listLogs: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      groupe: 'Groupe',
      reservation: 'Réservations',
      modification: 'Modifications',
      annulation: 'Annulations',
      dialog: false,
    }
  },
  methods: {
    triggerDialog () {
      this.dialog = !this.dialog
    },
  },
}
</script>
