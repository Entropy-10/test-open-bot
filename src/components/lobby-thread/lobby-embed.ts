import { embedColor } from '@utils'
import { EmbedBuilder } from 'discord.js'

export const lobbyEmbed = new EmbedBuilder()
	.setTitle('RO32: Team 1 vs Team 2')
	.setColor(embedColor)
	.setDescription(
		'Welcome to your RO32 match! Please listen to your referee for further instructions. Good luck and have fun!'
	)
	.addFields(
		{ name: 'Team 1 Captain', value: 'world', inline: true },
		{ name: 'Team 2 Captain', value: 'dlrow', inline: true },
		{ name: 'Referee', value: 'hello', inline: false },
		{ name: 'Best Of', value: '13', inline: true },
		{ name: 'Bans', value: '2', inline: true }
	)
