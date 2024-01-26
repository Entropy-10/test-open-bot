import env from '@env'
import { channelMention, roleMention, userMention } from 'discord.js'

import type { Client, Guild } from 'discord.js'
import type { DiscordBot } from './zenith'

/** Whether the environment is production. */
export const isProd = env.NODE_ENV === 'production'

/** The default color for embeds. */
export const embedColor = '#5E72EB'

/**
 * Makes an authenticated request to uptime API.
 *
 * @param {string} endpoint - The endpoint to make the request from.
 * @param {string} [apiVersion=v2] - The version of the API to use.
 */
export async function uptimeRequest(
	endpoint: string,
	apiVersion: 'v1' | 'v2' = 'v2'
) {
	const response = await fetch(
		`https://uptime.betterstack.com/api/${apiVersion}/${
			endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
		}`,
		{ headers: { Authorization: `Bearer ${env.UPTIME_API_KEY}` } }
	)

	return await response.json()
}

/**
 * Gets the specified (default is first) capture group from a regex match.
 *
 * @param {string} string - The string to match.
 * @param {RegExp} regex - The regex to use.
 * @param {number} index - The index of the capture group to get.
 */
export function getMatch(string: string, regex: RegExp, index = 1) {
	return string.match(regex)?.[index] ?? null
}

/**
 * Attempts to get a guild from the cache, if it doesn't exist it will fetch it.
 *
 * @param client - The client to fetch the guild from.
 * @param id - The id of the guild to fetch.
 */
export async function guildFetch(client: DiscordBot | Client, id: string) {
	return client.guilds.cache.get(id) ?? (await client.guilds.fetch(id))
}

/**
 * Attempts to get a member from the cache, if it doesn't exist it will fetch it.
 *
 * @param guild - The guild to fetch the member from.
 * @param id - The id of the member to fetch.
 */
export async function memberFetch(guild: Guild, id: string) {
	return guild.members.cache.get(id) ?? (await guild.members.fetch(id))
}

/**
 * Attempts to get a channel from the cache, if it doesn't exist it will fetch it.
 *
 * @param guild - The guild to fetch the channel from.
 * @param id - The id of the channel to fetch.
 */
export async function channelFetch(guild: Guild, id: string) {
	return guild.channels.cache.get(id) ?? (await guild.channels.fetch(id))
}

/**
 * Creates the correct discord mention format.
 *
 * @param {string} id - The id of the mention.
 * @param {Mention} [type='user'] - The optional type of mention to be created. By default is user.
 */
export function mention(id: string, type?: 'channel' | 'role' | 'user') {
	if (!isProd) return id

	switch (type) {
		case 'channel':
			return channelMention(id)
		case 'role':
			return roleMention(id)
		default:
			return userMention(id)
	}
}

/**
 * Waits for the specified amount of time.
 *
 * @param {number} ms - The amount of time to wait in milliseconds.
 */
export async function wait(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms))
}
