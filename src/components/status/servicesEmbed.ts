import { EmbedBuilder } from 'discord.js'

import {
	createStatusHistory,
	getUptime,
	statusInfo
} from '~/components/status/utils'

import type { Resource, StatusPage } from '~/types'

export function createServicesEmbed(page: StatusPage, resources: Resource[]) {
	const status = page.attributes.aggregate_state

	return new EmbedBuilder()
		.setTitle(StatusTitle[status])
		.setColor(statusInfo[status].color)
		.addFields(
			resources.map(r => {
				const { public_name, availability, status_history } = r.attributes
				return {
					name: `\n- ${public_name}`,
					value: `**${getUptime(availability)}% Uptime**\n${createStatusHistory(
						status_history
					)}`
				}
			})
		)
}

enum StatusTitle {
	operational = '|------ All services are currently online ------|',
	downtime = '|----- Some services are currently down -----|',
	degraded = '|--- Some services are currently degraded ---|',
	maintenance = '|-- There is currently ongoing maintenance  --|'
}
