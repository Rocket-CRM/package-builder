export default {
  editor: {
    label: 'Package Builder',
    icon: 'box',
  },
  actions: [
    {
      name: 'refreshList',
      label: { en: 'Refresh Package List' },
      action: 'refreshList',
    },
    {
      name: 'openCreate',
      label: { en: 'Open Create Panel' },
      action: 'openCreate',
    },
    {
      name: 'openEdit',
      label: { en: 'Open Edit Panel' },
      action: 'openEdit',
      args: [
        {
          name: 'packageId',
          type: 'Text',
          label: { en: 'Package ID (UUID)' },
        },
      ],
    },
    {
      name: 'closeSidebar',
      label: { en: 'Close Sidebar' },
      action: 'closeSidebar',
    },
  ],
  triggerEvents: [
    {
      name: 'package-saved',
      label: { en: 'Package saved' },
      event: { packageId: '', title: '', data: {} },
    },
    {
      name: 'list-loaded',
      label: { en: 'Package list loaded' },
      event: { packages: [], count: 0 },
    },
    {
      name: 'sidebar-opened',
      label: { en: 'Sidebar opened' },
      event: { mode: '', packageId: '' },
    },
    {
      name: 'sidebar-closed',
      label: { en: 'Sidebar closed' },
      event: {},
    },
    {
      name: 'error',
      label: { en: 'Error' },
      event: { message: '' },
    },
  ],
  properties: {
    supabaseUrl: {
      label: { en: 'Supabase URL' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'https://wkevmsedchftztoolkmi.supabase.co',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Supabase project URL',
      },
      propertyHelp: {
        tooltip: 'Base URL of your Supabase project',
      },
      /* wwEditor:end */
    },
    apiKey: {
      label: { en: 'API Key (anon)' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZXZtc2VkY2hmdHp0b29sa21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTM2OTgsImV4cCI6MjA2NjA4OTY5OH0.bd8ELGtX8ACmk_WCxR_tIFljwyHgD3YD4PdBDpD-kSM',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Supabase anon/public key',
      },
      propertyHelp: {
        tooltip: 'The anon (public) API key for your Supabase project',
      },
      /* wwEditor:end */
    },
    userAccessToken: {
      label: { en: 'User Access Token' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: '',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'JWT access token from authenticated user session',
      },
      propertyHelp: {
        tooltip:
          'Bind this to the authenticated user access token from your auth provider. Required for merchant-scoped API calls.',
      },
      /* wwEditor:end */
    },
  },
}
