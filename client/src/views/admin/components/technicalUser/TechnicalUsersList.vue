<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="technicalUsers"
      :items-per-page="10"
      :class="`elevation-1 ${isArchivedTechnicalUsers ? 't-list-archive-technical-users' : 't-list-technical-users'}`"
    >
      <!-- <template #[`item.action`]="{ item }">
        <update-technical-user
          :is-archived-technical-users="isArchivedTechnicalUsers"
          :email="item.email"
        />
        <delete-technical-user
          v-if="!isArchivedTechnicalUsers"
          :email="item.email"
        />
      </template> -->
    </v-data-table>
  </div>
</template>

<script>
export default {
  name: 'TechnicalUsersList',

  props: {
    technicalUsers: {
      type: Array,
      default: () => [],
    },
    isArchivedTechnicalUsers: {
      type: Boolean,
      default: false,
    },
  },

  data () {
    return {
      headers: [
        { text: 'Adresse courriel', value: 'email', class: 'text-uppercase' },
        { text: 'Actions', value: 'action', align: 'center', class: 'text-uppercase' },
      ],
    }
  },
}
</script>
