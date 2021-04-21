<template>
  <v-card>
    <v-data-table
      :headers="headers"
      :items="listDatas"
      :items-per-page="5"
    />
  </v-card>
</template>

<script>

export default {
  name: 'DetailsContentNational',
  props: {
    listLogs: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      headers: [
        { text: 'date', value: 'date', class: 'text-uppercase' },
        { text: 'Groupe 1', value: '0', class: 'text-uppercase' },
        { text: 'Groupe 2', value: '1', class: 'text-uppercase' },
        { text: 'Groupe 3', value: '2', class: 'text-uppercase' },
        { text: 'Groupe 4', value: '3', class: 'text-uppercase' },
        { text: 'Groupe 5', value: '4', class: 'text-uppercase' },
        { text: 'Groupe 6', value: '5', class: 'text-uppercase' },
      ],
    }
  },
  computed: {
    listDatas () {
      return this.listLogs.map(({ dateStr, statuses }) => {
        return {
          date: dateStr,
          ...statuses,
        }
      })
    },
  },
}
</script>
