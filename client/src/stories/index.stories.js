/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue'
import { action } from '@storybook/addon-actions'
// admin Components
import AdminLogin from '../views/admin/components/Login.vue'
import AdminCalendar from '../views/admin/components/AdminCalendar.vue'
import AdminHeader from '../views/admin/components/AdminHeader.vue'
import AdminFooter from '../views/admin/components/AdminFooter.vue'
import AdminAurige from '../views/admin/components/Aurige.vue'
import AdminCandidatList from '../views/admin/components/CandidatsList.vue'
import AdminWhiteList from '../views/admin/components/Whitelist.vue'

// candidat Components
import CandidatProfile from '../views/candidat/components/MyProfile.vue'
import CandidatProfileInfo from '../views/candidat/components/ProfileInfo.vue'
import CandidatSignupForm from '../views/candidat/components/SignupForm.vue'
import CandidatNavigationDrawer from '../views/candidat/components/NavigationDrawer.vue'
import CandidatEmailValidation from '../views/candidat/components/EmailValidationComponent.vue'
import CandidatHeader from '../views/candidat/components/CandidatHeader.vue'
import CandidatFooter from '../views/candidat/components/CandidatFooter.vue'

storiesOf('Admin Components', module)
  .add('AdminLogin', () => ({
    components: { AdminLogin },
    template: '<Login />',
    methods: { action: action('clicked') },
  }))
  .add('AdminCalendar', () => ({
    components: { AdminCalendar },
    template: '<admin-calendar />',
    methods: { action: action('clicked') },
  }))
  .add('AdminHeader', () => ({
    components: { AdminHeader },
    template: '<admin-header />',
    methods: { action: action('clicked') },
  }))
  .add('AdminFooter', () => ({
    components: { AdminFooter },
    template: '<admin-footer />',
    methods: { action: action('clicked') },
  }))
  .add('AdminAurige', () => ({
    components: { AdminAurige },
    template: '<admin-aurige />',
    methods: { action: action('clicked') },
  }))
  .add('AdminCandidatList', () => ({
    components: { AdminCandidatList },
    template: '<candidat-list />',
    methods: { action: action('clicked') },
  }))
  .add('AdminWhiteList', () => ({
    components: { AdminWhiteList },
    template: '<white-list />',
    methods: { action: action('clicked') },
  }))

storiesOf('Candidat Components', module)
  .add('CandidatProfile', () => ({
    components: { CandidatProfile },
    template: '<my-profile />',
    methods: { action: action('clicked') },
  }))
  .add('CandidatProfileInfo', () => ({
    components: { CandidatProfileInfo },
    template: '<profile-info />',
    methods: { action: action('clicked') },
  }))
  .add('CandidatSignupForm', () => ({
    components: { CandidatSignupForm },
    template: '<signup-form />',
    methods: { action: action('clicked') },
  }))
  .add('CandidatNavigationDrawer', () => ({
    components: { CandidatNavigationDrawer },
    template: '<navigation-drawer />',
    methods: { action: action('clicked') },
  }))
  .add('CandidatEmailValidation', () => ({
    components: { CandidatEmailValidation },
    template: '<email-validation />',
    methods: { action: action('clicked') },
  }))
  .add('CandidatHeader', () => ({
    components: { CandidatHeader },
    template: '<candidat-header />',
    methods: { action: action('clicked') },
  }))
  .add('CandidatFooter', () => ({
    components: { CandidatFooter },
    template: '<candidat-footer />',
    methods: { action: action('clicked') },
  }))
