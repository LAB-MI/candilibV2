/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue'

import AppVersion from '../components/AppVersion.vue'

storiesOf('Common/AppVersion', module)
  .add('Basic', () => ({
    components: { AppVersion },
    template: '<app-version />',
  }))
