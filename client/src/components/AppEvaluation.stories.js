import { storiesOf } from '@storybook/vue'
import AppEvaluation from '@/components/AppEvaluation'

storiesOf('Common/Evaluation', module)
  .add('bandeaubeta', () => ({
    components: {
      AppEvaluation,
    },
    template: `<app-evaluation/>`,
  }))
