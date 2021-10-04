<template>
  <div class="t-update-candidat-can-book-from">
    <div
      class="u-flex u-flex--v-center t-update-candidat-can-book-from-read"
    >
      <strong class="label">{{ title }} :</strong>
      <span
        class="value"
      > {{ canBookFromLegible }}</span>
      <v-btn
        v-if="isDisplay"
        v-show="!isOnEdit"
        color="error"
        icon
        class="btn-label t-update-candidat-can-book-from-edit"
        @click="isOnEdit=true"
      >
        <v-icon>delete</v-icon>
      </v-btn>
    </div>
    <confirm-box
      v-if="isOnEdit"
      :close-action="onCancel"
      :submit-action="updateCandidatCanBookFrom"
      :disabled-ok="!isValid"
      ok-button-color="error"
      cancel-button-text="Annuler"
    >
      <p class="text-center">
        <v-icon color="error">
          warning
        </v-icon>
        Voulez-vous vraiment supprimer de la pénalité de ce candidat?<br>
        Cette action est irréversible.
      </p>
    </confirm-box>
  </div>
</template>

<script>
import ConfirmBox from '@/components/ConfirmBox.vue'
import { FETCH_REMOVE_CANDIDAT_CANBOOK_REQUEST } from '@/store'

export default {
  name: 'FicheCandidatCanBookFrom',
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
      canBookFromLegible: this.info.canBookFromLegible,
      isOnEdit: false,
      isDisplay: !!this.info.canBookFrom,
    }
  },
  computed: {
    isValid () {
      return this.isDisplay
    },
  },
  methods: {
    onCancel () {
      this.isOnEdit = false
    },
    async updateCandidatCanBookFrom () {
      if (!this.isValid) { return }
      try {
        await this.$store.dispatch(FETCH_REMOVE_CANDIDAT_CANBOOK_REQUEST)
        this.isOnEdit = false
      } catch (error) {
      }
    },
  },
}
</script>

<style  lang="stylus" scoped>
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
