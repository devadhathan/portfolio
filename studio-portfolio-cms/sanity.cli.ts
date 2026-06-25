import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'k2bhj8hq',
    dataset: 'production'
  },
  deployment: {
    appId: 'm87w3jooqw9wj8drzjoujpdb',
    autoUpdates: true,
  },
})
