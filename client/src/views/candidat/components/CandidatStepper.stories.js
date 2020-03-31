import { storiesOf } from '@storybook/vue'

import CandidatStepper from './CandidatStepper.vue'

storiesOf('Candidat', module)
  .add('Stepper', () => ({
    components: { CandidatStepper },
    template: '<candidat-stepper />',
  }))
