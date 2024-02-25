import { Environment } from '@types'
import {
	boolean,
	coerce,
	enum_,
	number,
	object,
	optional,
	string
} from 'valibot'

import { fromEnv, handleParse } from './helpers'

//* Define environment variables here
const envSchema = object({
	NODE_ENV: optional(enum_(Environment), Environment.development),
	DISCORD_TOKEN: string([fromEnv()]),
	LOG_SOURCE_TOKEN: string([fromEnv()]),
	CLIENT_ID: string([fromEnv()]),
	GLOBAL_PUSH: optional(
		coerce(boolean(), i => i === 'true'),
		false
	),
	DEV_GUILD: string([fromEnv()]),
	UPTIME_API_KEY: string([fromEnv()]),
	STATUS_PAGE_ID: string([fromEnv()]),
	UPTIME_API_URL: string([fromEnv()]),
	BOT_RESOURCE_ID: coerce(number(), Number),
	WEB_RESOURCE_ID: coerce(number(), Number),
	API_RESOURCE_ID: coerce(number(), Number),
	HEARTBEAT_ID: string([fromEnv()]),
	DEV_ROLE: string([fromEnv()]),
	TICKET_CHANNEL: string([fromEnv()]),
	ADMIN_CHANNEL: string([fromEnv()]),
	ADMIN_ROLE: string([fromEnv()]),
	OSU_API_KEY: string([fromEnv()]),
	GOOGLE_SERVICE_ACCOUNT_EMAIL: string([fromEnv()]),
	GOOGLE_PRIVATE_KEY: string([fromEnv()]),
	LOOKING_FOR_TEAM_CHANNEL: string([fromEnv()]),
	UNVERIFIED_ROLE: string([fromEnv()]),
	OPERATIONAL_EMOJI: string([fromEnv()]),
	DOWNTIME_EMOJI: string([fromEnv()]),
	DEGRADED_EMOJI: string([fromEnv()]),
	MAINTENANCE_EMOJI: string([fromEnv()]),
	NOT_MONITORED_EMOJI: string([fromEnv()]),
	MODERATOR_ROLE: string([fromEnv()]),
	SUPABASE_SERVICE_ROLE_KEY: string([fromEnv()]),
	SUPABASE_URL: string([fromEnv()]),
	VERIFIED_ROLE: string([fromEnv()]),
	MATCH_CHANNEL_ID: string([fromEnv()]),
	REACTION_CHANNEL_ID: string([fromEnv()]),
	GENERAL_PING_ROLE_ID: string([fromEnv()]),
	TOURNEY_PING_ROLE_ID: string([fromEnv()]),
	STREAM_PING_ROLE_ID: string([fromEnv()]),
	GIVEAWAY_PING_ROLE_ID: string([fromEnv()]),
	CROSS_EMOJI: string([fromEnv()]),
	MINUS_EMOJI: string([fromEnv()]),
	X_TOKEN: string([fromEnv()])
})

export default handleParse(envSchema)
