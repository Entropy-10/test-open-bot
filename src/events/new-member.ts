import env from '@env'
import { wait } from '@utils'
import { ZenithError, createEvent } from 'zenith'

export default createEvent('guildMemberAdd', {
	name: 'New Member',
	execute: async (client, member) => {
		if (
			member.roles.cache.has(env.UNVERIFIED_ROLE) ||
			member.roles.cache.has(env.VERIFIED_ROLE)
		) {
			return
		}

		try {
			for (let attempt = 0; attempt < 3; attempt++) {
				const role = await member.roles
					.add(env.UNVERIFIED_ROLE)
					.catch(() =>
						client.logger.warn(
							`Failed to add unverified role to ${
								member.user.globalName
							} on attempt ${attempt + 1}, retrying...`,
							'medium'
						)
					)

				if (role) return
				await wait(2000)
			}

			throw new ZenithError({
				code: 'FailedToAddUnverifiedRole',
				message: `Failed to add unverified role to ${member.user.globalName} after three attempts.`
			})
		} catch (err) {
			if (err instanceof ZenithError) return client.logger.error(err.message)
			console.log(err)
		}
	}
})
