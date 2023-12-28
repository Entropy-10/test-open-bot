import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

const verifyButton = new ButtonBuilder()
  .setLabel('Verify')
  .setURL('https://test-open.com/verify')
  .setStyle(ButtonStyle.Link)

export const verifyRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
  verifyButton
])
