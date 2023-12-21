import dayjs from 'dayjs'
import { EmbedBuilder } from 'discord.js'

import { Resource, StatusReport } from '~/types'
import { createStatusHistory, getUptime, statusInfo } from './utils'

export function createServiceEmbed(
  resource: Resource,
  latestReport?: StatusReport
) {
  const { public_name, availability, status_history } = resource.attributes
  const status = status_history.toReversed()[0].status
  const report = latestReport?.attributes
  const maintenance = report?.report_type === 'maintenance'

  return new EmbedBuilder()
    .setTitle(
      `|------ The ${public_name.toLowerCase()} ${StatusInfo[status]} ------|`
    )
    .setColor(statusInfo[status].color)
    .setDescription(
      `**${getUptime(availability)}% Uptime**\n${createStatusHistory(
        status_history
      )}`
    )
    .addFields({
      name: maintenance ? 'Maintenance' : 'Latest Report',
      value: report
        ? `|‎ ‎ ‎ Overview: ${report.title}\n|‎ ‎ ‎ *Started at ${formatDate(
            report.starts_at
          )}${report.ends_at ? `| Ends at ${formatDate(report.ends_at)}` : ''}*`
        : 'No reports'
    })
}

enum StatusInfo {
  operational = 'is currently online',
  downtime = 'is currently down',
  degraded = 'is currently degraded',
  maintenance = 'has ongoing maintenance',
  not_monitored = 'is not monitored'
}

function formatDate(date: string) {
  return dayjs(date).format('M/D/YY h:mm a')
}
