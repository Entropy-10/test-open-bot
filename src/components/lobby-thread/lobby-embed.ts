import { embedColor } from '@utils'
import { EmbedBuilder, time } from 'discord.js'

export function createLobbyEmbed(
	id: number,
	referee: string,
	date: Date,
	password: string | undefined
) {
	return new EmbedBuilder()
		.setTitle(`TEST: Qualifier Lobby ${id}`)
		.setColor(embedColor)
		.setDescription(
			'Welcome to your qualifier lobby! Use this thread to discuss anything regarding your lobby, and please review the information below.'
		)
		.addFields(
			{
				name: 'Referee',
				value: referee,
				inline: true
			},
			{ name: 'Start Time', value: time(date), inline: true },
			{
				name: 'Password',
				value: password ?? 'No Password',
				inline: false
			}
		)
}
