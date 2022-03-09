<template>
  <div class="t-update-candidat-home-departement">
    <div
      v-if="!isOnEdit"
      class="u-flex u-flex--v-center t-update-candidat-home-departement-read"
    >
      <strong class="label">{{ title }} :</strong>
      <span

        class="value t-home-departement-value"
      >{{ homeDepartement }}</span>
      <v-btn
        v-show="!isOnEdit"
        color="success"
        icon
        class="btn-label t-update-candidat-home-departement-edit"
        @click="isOnEdit=true"
      >
        <v-icon>create</v-icon>
      </v-btn>
    </div>
    <confirm-box
      v-else
      :close-action="onCancel"
      :submit-action="updateCandidatHomeDepartement"
      :disabled-ok="!(selectedHomeDepartement !== homeDepartement)"
      :cancel-button-text="'Annuler'"
    >
      <div>
        <strong class="label">
          {{ title }} :
        </strong>
        <v-select
          v-model="selectedHomeDepartement"
          class="t-select-departements-to-edit mt-4"
          :items="adminDepartementList"
          label="Selectionner le nouveau département de résidence"
          dense
          solo
        />
      </div>
    </confirm-box>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import {
  FETCH_UPDATE_CANDIDAT_HOME_DEPARTEMENT_REQUEST,
} from '@/store'
import ConfirmBox from '@/components/ConfirmBox.vue'

export default {
  name: 'FicheCandidatHomeDepartement',
  components: {
    ConfirmBox,
  },
  props: {
    info: {
      type: Object,
      default: () => {},
    },
    title: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      homeDepartement: this.info.homeDepartement,
      selectedHomeDepartement: this.info.homeDepartement,
      isOnEdit: false,
    }
  },
  computed: {
    ...mapState({
      adminDepartementList: state => state.admin.departements.list,
    }),
  },
  methods: {
    onCancel () {
      this.isOnEdit = false
      this.selectedHomeDepartement = this.info.homeDepartement
    },
    async updateCandidatHomeDepartement () {
      try {
        await this.$store.dispatch(FETCH_UPDATE_CANDIDAT_HOME_DEPARTEMENT_REQUEST, this.selectedHomeDepartement)
        this.isOnEdit = false
      } catch (error) {
      }
    },
  },
}
</script>

<style scoped>
.btn-label {
  height: 1em;
}

.label {
  line-height: 1.5em;
  flex-basis: 15rem;
}

.value {
  flex-shrink: 1;
}
</style>
