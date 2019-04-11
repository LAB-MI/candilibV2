<template>
  <v-flex>
    <v-btn-toggle v-if="isTwoDepartement" mandatory>
      <v-btn :style="isThisDepartementSelected(firstDepartement) ? 'border: medium solid red;' : ''" @click="selectDepartement(firstDepartement)" flat>
        {{ firstDepartement }}
      </v-btn>
      <v-btn :style="isThisDepartementSelected(secondDepartement) ? 'border: medium solid red;' : ''" @click="selectDepartement(secondDepartement)" flat>
        {{ secondDepartement }}
      </v-btn>
    </v-btn-toggle>
    <v-btn-toggle v-else mandatory>
      <v-btn :style="isThisDepartementSelected(firstDepartement) ? 'border: medium solid red;' : ''" flat>
        {{ firstDepartement }}
      </v-btn>
    </v-btn-toggle>
  </v-flex>
</template>

<script>
import { mapState } from 'vuex'

import { SELECT_DEPARTEMENT, FETCH_ADMIN_INFO_REQUEST } from '@/store'

export default {
  data () {
    return {
      firstDepartement: '',
      secondDepartement: '',
    }
  },

  computed: {
    ...mapState(['admin']),
  },

  methods: {
    isThisDepartementSelected (departement) {
      if (this.admin.selectedDepartement === departement) {
        return true
      }
      return false
    },
    selectDepartement (departement) {
      this.$store.dispatch(SELECT_DEPARTEMENT, departement)
    },

    isTwoDepartement () {
      if (this.admin.list.departements.length &&
      this.admin.list.departements.length === 2) {
        return true
      }
      return false
    },
  },

  async mounted () {
    await this.$store.dispatch(FETCH_ADMIN_INFO_REQUEST)
    this.firstDepartement = this.admin.list.departements[0]
    this.secondDepartement = this.admin.list.departements[1]
  },
}
</script>
