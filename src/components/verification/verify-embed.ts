import { embedColor, mention } from '@utils'
import { EmbedBuilder } from 'discord.js'

export const verifyEmbed = new EmbedBuilder()
	.setTitle('Verification Information')
	.setColor(embedColor)
	.setDescription(
		`Please click the \`verify\` button below to get access to the server. If you have any issues getting verified contact ${mention(
			'1098012402324349070'
		)} or ${mention('322357246011113472')} by DM.`
	)
