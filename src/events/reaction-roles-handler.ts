import { createEvent } from 'zenith'

import { addRoles } from '~/components/reaction-roles'

export default createEvent('interactionCreate', {
	name: 'Reaction Role Handler',
	async execute(_, interaction) {
		if (!interaction.isStringSelectMenu()) return

		switch (interaction.customId) {
			case 'pings': {
				enum PingRoles {
					general = 'GENERAL_PING_ROLE_ID',
					tourney = 'TOURNEY_PING_ROLE_ID',
					stream = 'STREAM_PING_ROLE_ID',
					giveaway = 'GIVEAWAY_PING_ROLE_ID',
					social = 'SOCIAL_PING_ROLE_ID'
				}

				await addRoles(interaction, PingRoles)
			}
		}
	}
})
