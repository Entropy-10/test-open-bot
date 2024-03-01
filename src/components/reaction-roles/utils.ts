import env from '@env'
import { GuildMemberRoleManager } from 'discord.js'
import { Logger, ephem } from 'zenith'

import {
	allRolesRemovedEmbed,
	createRoleEmbed
} from '~/components/reaction-roles'

import type { EnvEnum } from '@types'
import type { StringSelectMenuInteraction } from 'discord.js'

export interface RoleStatus {
	roleId: string
	status: 'success' | 'failed' | 'already-exists'
	message?: string
}

const logger = new Logger()

/**
 * Adds roles to a member.
 *
 * @param {StringSelectMenuInteraction} interaction - The interaction of the member to add roles to.
 * @param {EnvEnum} enum_ - The enum  that maps the possible roles to add.
 */
export async function addRoles<TEnum extends EnvEnum>(
	interaction: StringSelectMenuInteraction,
	enum_: TEnum
) {
	const member = interaction.member
	if (!member || !(member.roles instanceof GuildMemberRoleManager)) return

	if (interaction.values.includes('remove')) {
		const rolesToRemove = Object.values(enum_).map(role => env[role])
		const roleStatus: RoleStatus[] = []

		for (const roleId of rolesToRemove) {
			if (typeof roleId !== 'string') throw new Error('Invalid role ID')

			await member.roles.remove(roleId).catch(err => {
				if (err instanceof Error) logger.error(err.message)
				roleStatus.push({
					roleId,
					status: 'failed',
					message: 'Failed to remove role'
				})
			})

			roleStatus.push({ roleId, status: 'success', message: 'Removed role' })
		}

		const failedRoles = roleStatus.some(role => role.status === 'failed')
		if (failedRoles) {
			return await interaction.reply(
				ephem({ embeds: [createRoleEmbed(roleStatus)] })
			)
		}

		return await interaction.reply(ephem({ embeds: [allRolesRemovedEmbed] }))
	}

	const values = interaction.values as (keyof typeof enum_)[]
	const roleStatus: RoleStatus[] = []

	const rolesToRemove = Object.values(enum_)
		.map(role => env[role])
		// @ts-expect-error not sure how to properly type this will look into it later
		.filter(roleId => !values.map(role => env[enum_[role]]).includes(roleId))

	for (const roleId of rolesToRemove) {
		if (typeof roleId !== 'string') throw new Error('Invalid role ID')

		if (!member.roles.cache.has(roleId)) continue

		await member.roles.remove(roleId).catch(err => {
			if (err instanceof Error) logger.error(err.message)
			roleStatus.push({
				roleId,
				status: 'failed',
				message: 'Failed to remove role'
			})
		})

		roleStatus.push({ roleId, status: 'success', message: 'Removed role' })
	}

	for (const value of values) {
		const roleId = env[enum_[value]]
		if (typeof roleId !== 'string') throw new Error('Invalid role ID')
		if (member.roles.cache.has(roleId)) {
			roleStatus.push({ roleId, status: 'already-exists' })
			continue
		}

		await member.roles.add(roleId).catch(err => {
			if (err instanceof Error) logger.error(err.message)
			roleStatus.push({ roleId, status: 'failed' })
		})

		roleStatus.push({ roleId, status: 'success' })
	}

	await interaction.reply(ephem({ embeds: [createRoleEmbed(roleStatus)] }))
}
