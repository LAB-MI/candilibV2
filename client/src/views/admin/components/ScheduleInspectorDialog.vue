<template>
  <td class="text-xs-right">
    <div class="text-xs-center"
    >
      <v-dialog
        v-model="dialog"
        width="650"
      >
        <template v-slot:activator="{ on }">
          <v-btn
            color="white"
            dark
            v-on="on"
            @click="getCandidat"
          >
            <v-icon :color="color">
              {{ icon }}
            </v-icon>
          </v-btn>
        </template>
        <shedule-inspector-dialog-content
          :closeDialog="closeDialog"
          :flagModal="flagModal"
          :icon="icon"
          :content="content"
          :selectedDate="selectedDate"
          :updateContent="updateContent"
          :inspecteurId="inspecteurId"
          :centreInfo="centreInfo"
        />
      </v-dialog>
    </div>
  </td>
</template>

<script>
import SheduleInspectorDialogContent from './SheduleInspectorDialogContent.vue'
import { FETCH_CANDIDAT_REQUEST } from '@/store'

export default {
  components: {
    SheduleInspectorDialogContent,
  },

  data () {
    return {
      color: '#A9A9A9',
      dialog: false,
      icon: '',
      flagModal: undefined,
    }
  },

  props: {
    content: Object,
    selectedDate: String,
    updateContent: Function,
    inspecteurId: String,
    centreInfo: Object,
  },

  computed: {
    place () {
      return this.content.place
    },
  },

  methods: {
    setContext (place) {
      if (place === undefined) {
        this.color = '#A9A9A9'
        this.flagModal = 'block'
        this.icon = 'block'
        return
      }
      if ('candidat' in place) {
        this.color = 'blue'
        this.flagModal = 'face'
        this.icon = 'face'
        return
      }
      this.color = 'green'
      this.flagModal = 'check'
      this.icon = 'check_circle'
    },

    getCandidat () {
      const candidatId = this.place && this.place.candidat
      const departement = this.$store.state.admin.departements.active
      if (candidatId) {
        this.$store.dispatch(FETCH_CANDIDAT_REQUEST, { candidatId, departement })
      }
    },

    closeDialog () {
      this.dialog = false
    },
  },

  watch: {
    place (newVal) {
      this.setContext(newVal)
    },
  },

  mounted () {
    const place = this.place
    this.setContext(place)
  },
}
</script>
