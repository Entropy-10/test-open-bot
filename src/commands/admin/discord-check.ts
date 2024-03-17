import env from '@env'
import { sheetsClient } from '@sheets'
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { createCommand, ephem } from 'zenith'

export default createCommand({
	permissions: ['Administrator'],
	data: new SlashCommandBuilder()
		.setName('discord-check')
		.setDescription(
			'Checks if the currently registered players are in the discord server.'
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute({ interaction, client: { logger } }) {
		await interaction.deferReply({ ephemeral: true })

		const members = (await interaction.guild?.members.fetch())?.map(
			member => member.nickname ?? member.user.displayName
		)

		if (!members) {
			return await interaction.editReply(ephem('Failed to get guild members.'))
		}

		const rawSheetData = await sheetsClient.spreadsheets.values.get({
			spreadsheetId: env.ADMIN_SHEET_ID,
			range: 'api!C3:L300'
		})

		if (!rawSheetData.data.values) {
			return await interaction.editReply(ephem('Failed to get sheet data.'))
		}

		const apiSheetUsers = rawSheetData.data.values
			.map(row => ({
				osuName: row[0],
				inDiscord: row[9]
			}))
			.filter(user => user.osuName !== '')

		const updatedValues: string[] = []
		for (const user of apiSheetUsers) {
			if (members.includes(user.osuName)) updatedValues.push('TRUE')
			else updatedValues.push('FALSE')
		}

		try {
			await sheetsClient.spreadsheets.values.update({
				spreadsheetId: env.ADMIN_SHEET_ID,
				range: `api!L3:L${updatedValues.length + 3}`,
				valueInputOption: 'USER_ENTERED',
				requestBody: {
					range: `api!L3:L${updatedValues.length + 3}`,
					values: [updatedValues],
					majorDimension: 'COLUMNS'
				}
			})
		} catch (err) {
			if (err instanceof Error) logger.error(err.message)
			return await interaction.editReply(ephem('Failed to update sheet.'))
		}

		await interaction.editReply('Users checked and sheet updated!')
	}
})
