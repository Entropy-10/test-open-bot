import env from '@env'
import { getDocument } from '@sheets'
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
	async execute({ interaction, client }) {
		await interaction.deferReply({ ephemeral: true })

		const members = (await interaction.guild?.members.fetch())?.map(
			member => member.nickname ?? member.user.displayName
		)

		if (!members) {
			return await interaction.editReply(ephem('Failed to get guild members.'))
		}

		const adminDoc = await getDocument(env.ADMIN_SHEET_ID)
		const apiSheet = adminDoc.sheetsByTitle.api

		const rows = await apiSheet.getRows({ offset: 2, limit: 500 })

		for (let i = 0; i < rows.length; i++) {
			const { osu_id, osu_name, discord } = rows[i].toObject()
			if (!osu_name || !members.includes(osu_name) || discord === 'TRUE') {
				continue
			}

			rows[i].assign({
				osu_name: `=HYPERLINK("https://osu.ppy.sh/users/${osu_id}","${osu_name}")`,
				discord: 'TRUE'
			})
			await rows[i].save()
		}

		await interaction.editReply('checked!')
	}
})
