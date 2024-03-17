import env from '@env'
import { getDocument } from '@sheets'
import { channelFetch, mention } from '@utils'
import {
	SlashCommandBuilder,
	TextChannel,
	ThreadAutoArchiveDuration
} from 'discord.js'
import { createCommand, ephem } from 'zenith'
import { createLobbyEmbed } from '~/components/lobby-thread'

export default createCommand({
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('lobby-thread')
		.setDescription('Creates a thread for the lobby you are refereeing.')
		.addIntegerOption(option =>
			option
				.setName('id')
				.setDescription('The lobby id to create a thread for.')
				.setMinValue(1)
				.setMaxValue(24)
				.setRequired(true)
		),
	async execute({ interaction }) {
		await interaction.deferReply({ ephemeral: true })

		if (!interaction.guild) {
			return await interaction.editReply(ephem('Failed to get guild.'))
		}

		const matchChannel = await channelFetch(
			interaction.guild,
			env.MATCH_CHANNEL_ID
		)
		const lobbyId = interaction.options.getInteger('id')

		if (!lobbyId) return await interaction.reply(ephem('Invalid lobby id.'))

		if (!matchChannel || !(matchChannel instanceof TextChannel)) {
			return await interaction.reply(ephem('Match threads channel is invalid.'))
		}

		const adminDoc = await getDocument(env.ADMIN_SHEET_ID)
		const qualsRefDoc = await getDocument(env.QUALS_REF_SHEET_ID)

		const scheduleSheet = adminDoc.sheetsByTitle.qScheduler
		const lobbySheet = qualsRefDoc.sheetsByTitle[lobbyId]

		if (!lobbySheet) {
			return await interaction.editReply(
				ephem('This lobby seems to not exist on the referee sheet.')
			)
		}

		await lobbySheet.loadCells('C6')

		const lobbyPassword = (await lobbySheet.getCellByA1('C6')).value as
			| string
			| undefined
		const lobbyRow = (
			await scheduleSheet.getRows<LobbyRow>({
				limit: 1,
				offset: 1 + lobbyId
			})
		)[0].toObject()

		const lobbyThread = await matchChannel.threads.create({
			name: `TEST: Qualifier Lobby ${lobbyId}`,
			autoArchiveDuration: ThreadAutoArchiveDuration.OneDay
		})

		await lobbyThread.join()
		await lobbyThread.send({
			embeds: [
				createLobbyEmbed(
					lobbyId,
					mention(lobbyRow.discord_ids?.split(',')[0] ?? ''),
					new Date((Number(lobbyRow.time) + 3600) * 1000),
					lobbyPassword
				)
			]
		})

		const mentions = lobbyRow.discord_ids
			?.split(',')
			.map(id => mention(id))
			.join(' ')

		mentions && (await lobbyThread.send(mentions))

		return await interaction.editReply(ephem('Lobby thread created.'))
	}
})

interface LobbyRow {
	id: string
	time: string
	discord_ids: string
}
