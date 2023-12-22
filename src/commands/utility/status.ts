import { createCommand } from 'zenith'
import env from '@env'
import { uptimeRequest } from '@utils'
import { SlashCommandBuilder } from 'discord.js'

import { createServiceEmbed, createServicesEmbed } from '~/components/status'

import type {
  Resource,
  StatusPage,
  StatusReport,
  UptimeDataResponse
} from '@types'

export default createCommand({
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check the statuses of services powering TEST Tournaments.')
    .addStringOption(option =>
      option
        .setName('service')
        .setDescription(
          'Select the specific service you would like to check the status of.'
        )
        .addChoices(
          { name: 'Website', value: 'website' },
          { name: 'Discord Bot', value: 'bot' },
          { name: 'API', value: 'api' }
        )
    ),
  async execute({ interaction }) {
    await interaction.deferReply()

    const service = interaction.options.getString('service') as
      | keyof typeof ServiceId
      | null

    if (!service) {
      const [pageData, resourcesData] = await Promise.all([
        uptimeRequest(`status-pages/${env.STATUS_PAGE_ID}`),
        uptimeRequest(`status-pages/${env.STATUS_PAGE_ID}/resources`)
      ])

      const page = (pageData as UptimeDataResponse<StatusPage>).data
      const resources = (resourcesData as UptimeDataResponse<Resource[]>).data

      return await interaction.editReply({
        embeds: [createServicesEmbed(page, resources)]
      })
    }

    const { resource, latestReport } = await getServiceData(ServiceId[service])

    return await interaction.editReply({
      embeds: [createServiceEmbed(resource, latestReport)]
    })
  }
})

enum ServiceId {
  website = env.WEB_RESOURCE_ID,
  bot = env.BOT_RESOURCE_ID,
  api = env.API_RESOURCE_ID
}

async function getServiceData(serviceId: number) {
  const [reportsData, resourceData] = await Promise.all([
    uptimeRequest(`/status-pages/${env.STATUS_PAGE_ID}/status-reports`),
    uptimeRequest(`status-pages/${env.STATUS_PAGE_ID}/resources/${serviceId}`)
  ])

  const resource = (resourceData as UptimeDataResponse<Resource>).data
  const reports = (reportsData as UptimeDataResponse<StatusReport[]>).data

  const sortedReports = reports.sort(
    (a, b) =>
      new Date(b.attributes.starts_at).getTime() -
      new Date(a.attributes.starts_at).getTime()
  )

  const latestReport = sortedReports.find(report =>
    report.attributes.affected_resources.some(
      affectedResource =>
        affectedResource.status_page_resource_id === String(serviceId)
    )
  )

  return { resource, latestReport }
}
