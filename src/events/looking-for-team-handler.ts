import env from '@env'
import { supabase } from '@supabase'
import { getMatch, mention } from '@utils'
import { LegacyClient } from 'osu-web.js'
import { createEvent, ephem } from 'zenith'

import { panelEmbed, panelRow, postModal } from '~/components/looking-for-team'
import { createPostEmbed } from '~/components/looking-for-team/post-embed'

import type { ModalSubmitInteraction } from 'discord.js'

export default createEvent('interactionCreate', {
	name: 'Looking For Team Handler',
	execute: async ({ logger }, interaction) => {
		if (!interaction.isButton()) return
		if (!['create-post', 'delete-post'].includes(interaction.customId)) return

		if (!interaction.guild || !interaction.channel) {
			await interaction.reply(ephem('Failed to get guild or channel.'))
			return logger.error('Interaction is not in a guild or channel.')
		}

		if (interaction.customId === 'delete-post') {
			const { error: playerSelectError, data: player } = await supabase
				.from('free-players')
				.select()
				.eq('discord_id', interaction.user.id)
				.maybeSingle()

			if (playerSelectError) {
				postCreateError()
				return logger.error(
					`Failed to select post: ${playerSelectError.message}`
				)
			}

			if (player) {
				const existingPostMessage = await interaction.channel.messages
					.fetch(player.message_id)
					.catch((err) => {
						postCreateError()
						return logger.error(`Failed to fetch post message: ${err.message}`)
					})

				existingPostMessage?.delete()
				await supabase
					.from('free-players')
					.delete()
					.eq('discord_id', interaction.user.id)

				await interaction.reply(ephem('Successfully deleted posts.'))
			}

			return
		}

		await interaction.showModal(postModal)

		const filter = (i: ModalSubmitInteraction) => {
			return (
				i.customId === 'looking-for-team-post' &&
				i.user.id === interaction.user.id
			)
		}
		const submit = await interaction.awaitModalSubmit({
			filter,
			time: 60000 * 30
		})

		const strengths = submit.fields.getTextInputValue('strengthsInput')
		const weaknesses = submit.fields.getTextInputValue('weaknessesInput')
		const osuProfile = getMatch(
			submit.fields.getTextInputValue('osuProfileInput'),
			/(?:https:\/\/osu\.ppy\.sh\/users\/)?(\d+)/
		)
		const timezone = getMatch(
			submit.fields.getTextInputValue('timezoneInput'),
			/([-+]\d+)/
		)

		if (!osuProfile) {
			const message = await interaction.channel.send({
				content: `${mention(
					interaction.user.id
				)} Incorrect osu profile format. Enter either your profile link or id. Please try again!`
			})

			setTimeout(() => message.delete(), 20000)
			return
		}

		if (!timezone) {
			const message = await interaction.channel.send(
				`${mention(
					interaction.user.id
				)} Incorrect timezone format. Enter your UTC timezone (ex: UTC-7). Please try again!`
			)

			setTimeout(() => message.delete(), 20000)
			return
		}

		const osuApi = new LegacyClient(env.OSU_API_KEY)
		const user = await osuApi.getUser({ u: osuProfile, m: 'osu' })

		if (!user) {
			logger.error('Failed to get osu user.')
			const message = await interaction.channel.send(
				`${mention(
					interaction.user.id
				)} Sorry I failed to get your osu profile.`
			)

			setTimeout(() => message.delete(), 20000)
			return
		}

		async function postCreateError() {
			if (!interaction.channel) return
			const errorMessage = await interaction.channel.send(
				`${mention(interaction.user.id)}, sorry I failed to create your post.`
			)

			setTimeout(() => errorMessage.delete(), 20000)
			return
		}

		const { error: playerSelectError, data: player } = await supabase
			.from('free-players')
			.select()
			.eq('discord_id', interaction.user.id)
			.maybeSingle()

		if (playerSelectError) {
			postCreateError()
			return logger.error(`Failed to select post: ${playerSelectError.message}`)
		}

		if (player) {
			const existingPostMessage = await interaction.channel.messages
				.fetch(player.message_id)
				.catch((err) => {
					postCreateError()
					return logger.error(`Failed to fetch post message: ${err.message}`)
				})

			existingPostMessage?.delete()
		}

		const postMessage = await interaction.channel.send({
			embeds: [
				createPostEmbed({
					interaction,
					user,
					timezone,
					strengths,
					weaknesses
				})
			]
		})

		const { error: playerInsertError } = await supabase
			.from('free-players')
			.insert({
				osu_id: String(user.user_id),
				discord_id: interaction.user.id,
				discord_name: interaction.user.username,
				rank: user.pp_rank,
				timezone: `UTC${timezone}`,
				message_id: postMessage.id,
				updated_at: new Date().toISOString()
			})

		if (playerInsertError) {
			postCreateError()
			await postMessage.delete()
			return logger.error(`Failed to insert post: ${playerInsertError.message}`)
		}

		const { error: panelSelectError, data: panel } = await supabase
			.from('looking-for-team-panel')
			.select()
			.eq('guild_id', interaction.guild.id)
			.single()

		if (panelSelectError) {
			postCreateError()
			await postMessage.delete()
			return logger.error(`Failed to select panel: ${panelSelectError.message}`)
		}

		const oldPanelMessage = await interaction.channel.messages.fetch(
			panel.message_id
		)
		oldPanelMessage.delete()

		const newPanelMessage = await interaction.channel.send({
			embeds: [panelEmbed],
			components: [panelRow]
		})

		const { error: panelUpsertError } = await supabase
			.from('looking-for-team-panel')
			.upsert({
				guild_id: interaction.guild.id,
				message_id: newPanelMessage.id,
				updated_at: new Date().toISOString()
			})

		if (panelUpsertError) {
			postCreateError()
			await postMessage.delete()
			return logger.error(`Failed to upsert panel: ${panelUpsertError.message}`)
		}

		await submit.reply(ephem('Successfully created free player post.'))
	}
})
