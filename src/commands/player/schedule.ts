import env from '@env'
import { getDocument } from '@sheets'
import { supabase } from '@supabase'
import { SlashCommandBuilder } from 'discord.js'
import { createCommand, ephem } from 'zenith'

export default createCommand({
	data: new SlashCommandBuilder()
		.setName('schedule')
		.setDescription('Used for scheduling qualifier lobbies.')
		.addIntegerOption(option =>
			option
				.setName('id')
				.setDescription("The id of the lobby you'd like to join.")
				.setMinValue(1)
				.setMaxValue(24)
				.setRequired(true)
		),
	async execute({ interaction }) {
		await interaction.deferReply({ ephemeral: true })

		const { data: settings } = await supabase
			.from('bot-settings')
			.select('*')
			.eq('guild_id', String(interaction.guildId))
			.maybeSingle()

		if (!settings) {
			return await interaction.editReply(ephem('Failed to get guild settings.'))
		}

		if (!settings.allow_schedules) {
			return await interaction.editReply(
				ephem(
					'Sorry, but schedules are currently locked. Please reach out to the hosts or admins if additional help is needed.'
				)
			)
		}

		const { data: teamData } = await supabase
			.from('users')
			.select('players(role,teams(name))')
			.eq('discord_tag', interaction.user.username)
			.maybeSingle()

		const player = teamData?.players
		const team = teamData?.players?.teams
		const lobbyId = interaction.options.getInteger('id')

		if (!team || !player || !lobbyId) {
			return await interaction.editReply(
				ephem(
					"Couldn't get team info. Have you joined the team on the website?"
				)
			)
		}

		if (player.role !== 'captain') {
			return await interaction.editReply(
				ephem('You must be the team captain to schedule a lobby.')
			)
		}

		const refDoc = await getDocument(env.QUALS_REF_SHEET_ID)
		const scheduleSheet = refDoc.sheetsByTitle.schedule
		const teamListing = refDoc.sheetsByTitle.teams

		const discordTags = (await teamListing.getCellsInRange(
			'B7:D204'
		)) as string[][]

		const teamName = discordTags.find(
			row => row[2] === interaction.user.username
		)?.[0]

		if (!teamName) {
			return await interaction.editReply(
				ephem('Sorry, but I could not find your team.')
			)
		}

		await scheduleSheet.loadCells('I3:K28')
		const teamsRange = (await scheduleSheet.getCellsInRange(
			'I3:K27'
		)) as string[][]

		const lobbyRow = teamsRange[lobbyId - 1]
		let lobbyIndex = lobbyRow.findIndex(team => team === '')

		if (lobbyIndex === -1) {
			if (lobbyRow.length === 0) lobbyIndex = 0
			else if (lobbyRow.length === 2) lobbyIndex = 2
			else lobbyIndex = -1
		}

		if (lobbyIndex < 0) {
			return await interaction.editReply(
				'Sorry, but this lobby is full. Please try a different lobby.'
			)
		}

		const rowOffset = 2
		const columnOffset = 8

		let existingTeam = { row: 0, column: 0 }
		teamsRange.find((lobby, index) => {
			if (lobby.includes(teamName))
				existingTeam = {
					row: index + rowOffset,
					column: lobby.findIndex(team => team === teamName) + columnOffset
				}
		})

		if (existingTeam.row !== 0) {
			const oldLobby = scheduleSheet.getCell(
				existingTeam.row,
				existingTeam.column
			)
			oldLobby.value = ''
		}

		const newLobby = scheduleSheet.getCell(
			lobbyId - 1 + rowOffset,
			lobbyIndex + columnOffset
		)
		newLobby.value = teamName

		await scheduleSheet.saveUpdatedCells()

		await interaction.editReply(
			ephem(`You are now scheduled to play in lobby ${lobbyId}.`)
		)
	}
})
