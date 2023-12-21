import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js'

import type { ModalActionRowComponentBuilder } from 'discord.js'

const subjectInput = new TextInputBuilder()
  .setLabel('Subject')
  .setStyle(TextInputStyle.Short)
  .setCustomId('subjectInput')
  .setRequired(true)

const descriptionInput = new TextInputBuilder()
  .setLabel('Description')
  .setStyle(TextInputStyle.Paragraph)
  .setCustomId('descriptionInput')
  .setRequired(true)

const subjectActionRow =
  new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
    subjectInput
  )
const descriptionActionRow =
  new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
    descriptionInput
  )

export const ticketModal = new ModalBuilder()
  .setTitle('Ticket')
  .setCustomId('ticket')
  .addComponents(subjectActionRow, descriptionActionRow)
