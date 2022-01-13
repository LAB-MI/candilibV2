<template>
  <v-dialog
    ref="dialog"
    v-model="modal"
    :return-value.sync="date"
    persistent
    width="590px"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-model="dateFormatted"
        :class="`t-btn-disable-at-${departement._id}`"
        label="Date"
        hint="MM/DD/YYYY format"
        persistent-hint
        prepend-icon="mdi-calendar"
        v-bind="attrs"
        v-on="on"
      >
        <span>
          {{ formatedDate }}
        </span>

          &nbsp;

        <v-icon
          color="primary"
        >
          calendar_today
        </v-icon>
      </v-btn>
    </template>
    <v-date-picker
      v-model="date"
      scrollable
      no-title
      @input="menu = false"
    >
      <v-spacer />
      <div class="flex flex-wrap">
        <v-btn
          :class="`t-btn-disaplly-disable-at-${departement._id}`"
          text
          outlined
          color="warning"
          @click="() => updateDepartementDisableAtDate(true)"
        >
          Déprogrammer
        </v-btn>

        <v-btn
          :class="`t-btn-unmodify-disable-at-${departement._id}`"
          text
          outlined
          color="error"
          @click="modal = false"
        >
          Ne pas modifier
        </v-btn>

        <v-btn
          :class="`t-btn-apply-disable-at-${departement._id}`"
          text
          outlined
          color="primary"
          :disabled="!date"
          @click="() => updateDepartementDisableAtDate(false)"
        >
          Programmer
        </v-btn>
      </div>
      <v-spacer />
    </v-date-picker>
  </v-dialog>
</template>

<script>

import { getFrenchLuxonFromIso, getFrenchLuxonFromSql } from '../../../../util'

export default {
  props: {
    departement: {
      type: Object,
      default: () => ({}),
    },
  },

  data () {
    return {
      modal: false,
      menu: false,
      date: undefined,
      dateFormatted: null,
    }
  },

  computed: {
    formatedDate () {
      const shapedDate = this.formatDate(getFrenchLuxonFromIso(this.departement.disableAt)?.toISODate())
      return shapedDate || 'Indéfini'
    },
  },

  methods: {
    async updateDepartementDisableAtDate (isForRemoveDisableAt = false) {
      const {
        _id,
        email,
        isAddedRecently,
      } = this.departement

      this.$emit('update-departement', {
        departementId: _id,
        newEmail: email,
        isAddedRecently,
        disableAt: !isForRemoveDisableAt ? getFrenchLuxonFromSql(this.date).toISO() : false,
      })

      this.modal = false
    },

    formatDate (date) {
      if (!date) return null

      const [year, month, day] = date.split('-')
      return `${day}/${month}/${year}`
    },
  },
}
</script>
