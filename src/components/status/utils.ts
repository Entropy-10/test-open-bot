import env from '@env'
import { formatEmoji } from 'discord.js'

import type { Resource, StatusInfo } from '~/types'

const timelineSpacer =
  '‎ ‎ ‎ ‎ ‎ ‎ ‎  ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎  ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ '

export const statusInfo: Record<string, StatusInfo> = {
  operational: {
    color: '#10B981',
    emoji: env.OPERATIONAL_EMOJI
  },
  downtime: {
    color: '#F87171',
    emoji: env.DOWNTIME_EMOJI
  },
  degraded: {
    color: '#F59E0B',
    emoji: env.DEGRADED_EMOJI
  },
  maintenance: {
    color: '#60A5FA',
    emoji: env.MAINTENANCE_EMOJI
  },
  not_monitored: {
    color: '#424757',
    emoji: env.NOT_MONITORED_EMOJI
  }
}

export function createStatusHistory(
  statusHistory: Resource['attributes']['status_history']
) {
  return `${statusHistory
    .reverse()
    .slice(0, 15)
    .toReversed()
    .map(history => formatEmoji(statusInfo[history.status].emoji))
    .join(' ')}\n*15 days ago*${timelineSpacer}*Today*`
}

export function getUptime(availability: number) {
  return (availability * 100).toFixed(3)
}
