import { SlashCommandBuilder } from 'discord.js'
import { createCommand } from 'zenith'

export default createCommand({
	data: new SlashCommandBuilder()
		.setName('schedule')
		.setDescription('Used for scheduling qualifier lobbies.'),
	async execute({ interaction }) {
		await interaction.reply('Schedule Command')
	}
})
