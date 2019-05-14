import { storiesOf } from '@storybook/vue'
import ConfirmBox from './ConfirmBox.vue'

storiesOf('Common/ConfirmBox', module)
  .add('ConfirmBox', () => ({
    components: {
      ConfirmBox,
    },
    template: `
    <confirm-box
      :closeAction="closeAction"
      :submitAction="submitAction"
    >
      <div>
        content
      </div>
    </confirm-box>
    `,
    methods: {
      closeAction: () => {
        alert('closeAction')
      },
      submitAction: () => {
        alert('submitAction')
      },
    },
  }))
