/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue'
import { action } from '@storybook/addon-actions'

import AdminLogin from '../views/admin/components/Login.vue'
import AdminCalendar from '../views/admin/components/AdminCalendar.vue'
import AdminHeader from '../views/admin/components/AdminHeader.vue'
import AdminFooter from '../views/admin/components/AdminFooter.vue'
import AdminAurige from '../views/admin/components/Aurige.vue'
import AdminCandidatList from '../views/admin/components/CandidatsList.vue'
import AdminWhiteList from '../views/admin/components/Whitelist.vue'
import AgGridAurigeStatusFilter from '../views/admin/components/AgGridAurigeStatusFilter.vue'

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
  .add('AgGridAurigeStatusFilter', () => ({
    components: { AgGridAurigeStatusFilter },
    template: '<ag-grid-aurige-status-filter />',
    methods: { action: action('clicked') },
  }))
