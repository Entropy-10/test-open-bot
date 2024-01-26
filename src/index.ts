import env from '@env'
import { isProd } from '@utils'
import { DiscordBot } from 'zenith'

const bot = new DiscordBot({
	startOnInitialize: false,
	developers: ['1098012402324349070'],
	intents: ['Guilds', 'GuildMembers', 'GuildMessages'],
	monitoring: {
		enabled: isProd,
		url: `https://uptime.betterstack.com/api/v1/heartbeat/${env.HEARTBEAT_ID}`,
		interval: 5
	}
})

export const logger = bot.logger

await bot.start()
