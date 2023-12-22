import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

import type { ButtonInteraction } from 'discord.js'

export function createTicketButtonRow(interaction?: ButtonInteraction) {
  const id = interaction?.customId
  return new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder()
      .setCustomId('finished')
      .setLabel('Finished')
      .setDisabled(id === 'finished' ? true : false)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('inprogress')
      .setLabel('In Progress')
      .setDisabled(id === 'inprogress' ? true : false)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('denied')
      .setLabel('Denied')
      .setDisabled(id === 'denied' ? true : false)
      .setStyle(ButtonStyle.Danger)
  ])
}
