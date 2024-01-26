import env from '@env'
import { guildFetch, memberFetch } from '@utils'
import { createEvent } from 'zenith'

export default createEvent('messageCreate', {
	name: 'Moderator Ping',
	async execute(client, message) {
		if (message.author.bot) return
		if (!message.mentions.roles.get(env.MODERATOR_ROLE)) return

		const guild = await guildFetch(client, message.guildId ?? '')
		const member = await memberFetch(guild, message.author.id)

		if (member.permissions.has('Administrator')) return

		message.reply({
			content:
				'Please note that moderators may not be able to help with tournament related matters. If you need help regarding the tournament please contact the hosts or admins.'
		})
	}
})
