import Vue from 'vue'

export default function getHistoryData () {
  return Vue.component('candidat-action-history-tab', {
    props: {
      items: {
        type: Array,
        default: () => [],
      },
    },
    data () {
      return {
        headers: [
          {
            text: 'Place du',
            value: 'frenchDate',
          },
          {
            text: 'Centre',
            value: 'centre',
          },
          {
            text: 'Département administratif',
            value: 'departement',
          },
          {
            text: 'IPCSR',
            value: 'inspecteur',
          },
          { text: 'Action', value: 'archiveReason' },
          { text: 'Éffectué par ', value: 'byUser' },
          { text: 'Éffectué le ', value: 'actionDate' },
          { text: 'Réservé par ', value: 'bookedByAdmin' },
          { text: 'Réservé le ', value: 'bookedAt' },
        ],
      }
    },

    template: `
    <v-card-text>
      <div>
      <v-data-table
      :headers="headers"
      :items="items"
      hide-default-footer
      class="elevation-1 t-history-table"
      ></v-data-table>
    </div>
    </v-card-text>
    `,
  })
}
