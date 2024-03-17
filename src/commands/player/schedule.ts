import env from '@env'
import { getDocument } from '@sheets'
import { supabase } from '@supabase'
import { SlashCommandBuilder } from 'discord.js'
import { createCommand, ephem } from 'zenith'

export default createCommand({
	devOnly: true,
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
		await interaction.deferReply()

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

		try {
			const adminDoc = await getDocument(env.ADMIN_SHEET_ID)
			const scheduleSheet = adminDoc.sheetsByTitle.qScheduler
			const range = (await scheduleSheet.getCellsInRange(
				'B4:M27'
			)) as string[][]
			const rowOffset = lobbyId - 1
			const row = range[rowOffset]

			if (!row[3].endsWith('filled.')) {
				return await interaction.editReply(
					ephem(
						'Sorry, but this lobby is either full, in progress, or completed. Please try another lobby.'
					)
				)
			}

			const existingLobby = range.find(row => row.includes(team.name))

			await scheduleSheet.loadCells('B4:M27')

			function setSlot(offset: number, value: string) {
				let columnOffset = 0
				for (let i = 1; i <= 5; i++) {
					if (row[i + 7] === undefined) {
						columnOffset = i + 7
						break
					}
				}
				const slotCell = scheduleSheet.getCell(offset + 3, columnOffset)
				slotCell.value = value
			}

			if (!existingLobby) {
				setSlot(rowOffset, team.name)
				await scheduleSheet.saveUpdatedCells()
			} else {
				setSlot(Number(existingLobby[0]) - 1, '')
				setSlot(rowOffset, team.name)
				await scheduleSheet.saveUpdatedCells()
			}

			return await interaction.editReply(`Lobby ${lobbyId} scheduled!`)
		} catch (err) {
			return await interaction.editReply(
				ephem(
					'Sorry, something went wrong while scheduling! Please try again and see if that helps.'
				)
			)
		}
	}
})
