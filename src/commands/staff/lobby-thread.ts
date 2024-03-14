import env from '@env'
import { getDocument } from '@sheets'
import {
	ChannelType,
	SlashCommandBuilder,
	TextChannel,
	ThreadAutoArchiveDuration,
	messageLink,
	time
} from 'discord.js'
import { createCommand, ephem } from 'zenith'
import { lobbyEmbed } from '~/components/lobby-thread'

export default createCommand({
	devOnly: true,
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

		const matchChannel = interaction.channel
		const lobbyId = interaction.options.getInteger('id')

		if (!lobbyId) return await interaction.reply(ephem('Invalid lobby id.'))

		if (!matchChannel || !(matchChannel instanceof TextChannel)) {
			return await interaction.reply(ephem('Match threads channel is invalid.'))
		}

		const adminDoc = await getDocument(env.ADMIN_SHEET_ID)
		const scheduleSheet = adminDoc.sheetsByTitle[env.QUAL_SCHEDULE_SHEET]
		const lobbyRow = (
			await scheduleSheet.getRows<LobbyRow>({
				limit: 1,
				offset: 1 + lobbyId
			})
		)[0].toObject()

		//console.log(Object.values(lobbyRow).slice(-5))

		const lobbyThread = await matchChannel.threads.create({
			name: `TEST: Qualifier Lobby ${lobbyId}`,
			autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
			type: ChannelType.PrivateThread,
			invitable: false
		})

		await lobbyThread.join()
		const threadMessage = await lobbyThread.send({ embeds: [lobbyEmbed] })
		await matchChannel.send(messageLink(lobbyThread.id, threadMessage.id))

		await interaction.editReply(
			ephem(
				"Match thread created. Please note that I'm still inviting players in the background, I will notify you once I finish."
			)
		)

		if (!lobbyRow.discord_ids) return console.log('No Ids')

		const addMemberResponse = await Promise.allSettled(
			lobbyRow.discord_ids.split(',').map(id => lobbyThread.members.add(id))
		)

		const successfulIds = addMemberResponse
			.map(response => response.status === 'fulfilled' && response.value)
			.filter(id => id !== false)

		if (successfulIds.length > 0) {
			await lobbyThread.send(
				`This lobby starts at ${time(new Date())} \n${successfulIds.join('')}`
			)
		}

		return await interaction.editReply(ephem('Match thread created.'))
	}
})

interface LobbyRow {
	id: string
	date: string
	time: string
	status: string
	discord_ids: string
	mp_link: string
	notes: string
	referee: string
	team1: string
	team2: string
	team3: string
	team4: string
	team5: string
}
