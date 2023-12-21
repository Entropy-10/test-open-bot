import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

const verifyButton = new ButtonBuilder()
  .setLabel('Verify')
  .setCustomId('verify')
  .setStyle(ButtonStyle.Primary)

export const verifyRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
  verifyButton
])
