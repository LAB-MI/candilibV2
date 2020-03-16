import { storiesOf } from '@storybook/vue'

import EmailPasswordReset from './EmailPasswordReset'

storiesOf('Admin/EmailResetPassword', module)
  .add('Basic', () => ({
    components: { EmailPasswordReset },
    template: `<email-password-reset
    @submit.prevent="sendMailResetLink"
    />`,
  }))
