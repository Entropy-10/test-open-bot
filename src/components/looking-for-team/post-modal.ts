import {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle
} from 'discord.js'

import type { ModalActionRowComponentBuilder } from 'discord.js'

const osuProfileInput = new TextInputBuilder()
	.setLabel('Osu Profile')
	.setPlaceholder('Insert profile link or id')
	.setStyle(TextInputStyle.Short)
	.setCustomId('osuProfileInput')
	.setRequired(true)

const timezoneInput = new TextInputBuilder()
	.setLabel('Timezone')
	.setPlaceholder('Insert your UTC timezone (ex: UTC-7)')
	.setMinLength(2)
	.setMaxLength(6)
	.setStyle(TextInputStyle.Short)
	.setCustomId('timezoneInput')
	.setRequired(true)

const strengthsInput = new TextInputBuilder()
	.setLabel('Strengths')
	.setStyle(TextInputStyle.Paragraph)
	.setCustomId('strengthsInput')
	.setRequired(true)

const weaknessesInput = new TextInputBuilder()
	.setLabel('Weaknesses')
	.setStyle(TextInputStyle.Paragraph)
	.setCustomId('weaknessesInput')
	.setRequired(true)

const osuProfileActionRow =
	new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
		osuProfileInput
	)
const timezoneActionRow =
	new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
		timezoneInput
	)

const strengthsActionRow =
	new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
		strengthsInput
	)

const weaknessesActionRow =
	new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
		weaknessesInput
	)

export const postModal = new ModalBuilder()
	.setTitle('Looking For Team Post')
	.setCustomId('looking-for-team-post')
	.addComponents(
		osuProfileActionRow,
		timezoneActionRow,
		strengthsActionRow,
		weaknessesActionRow
	)
