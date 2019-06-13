<template>
  <td class="text-xs-right">
    <div class="text-xs-center">
      <v-dialog
        v-model="dialog"
        width="650"
      >
        <template v-slot:activator="{ on }">
          <v-btn
            color="white"
            dark
            v-on="on"
          >
            <v-icon :color="setContext().color">
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

export default {
  components: {
    SheduleInspectorDialogContent,
  },

  data () {
    return {
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

  methods: {
    setContext () {
      if (this.content.place !== undefined) {
        if ('candidat' in this.content.place) {
          this.icon = 'face'
          this.flagModal = 'face'
          return {
            color: 'blue',
            content: this.content,
          }
        }
        this.flagModal = 'check'
        this.icon = 'check_circle'
        return {
          color: 'green',
          content: this.content,
        }
      }
      this.flagModal = 'block'
      this.icon = 'block'
      return {
        color: '#A9A9A9',
      }
    },

    closeDialog () {
      this.dialog = false
    },
  },
  mounted () {
    this.setContext()
  },
}
</script>
