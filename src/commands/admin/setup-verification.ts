import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { createCommand, ephem } from 'zenith'

import { verifyEmbed, verifyRow } from '~/components/verification'

export default createCommand({
	permissions: ['Administrator'],
	data: new SlashCommandBuilder()
		.setName('setup-verification')
		.setDescription('Setup the verification system for your server.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute({ interaction }) {
		const channel = interaction.channel
		if (!channel) {
			return await interaction.reply(ephem('Failed to get channel!'))
		}

		await channel.send({
			embeds: [verifyEmbed],
			components: [verifyRow]
		})

		await interaction.reply(ephem('Verification is now setup!'))
	}
})
