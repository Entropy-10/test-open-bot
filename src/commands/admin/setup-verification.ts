import { createCommand } from 'zenith'
import { SlashCommandBuilder } from 'discord.js'

import { verifyEmbed, verifyRow } from '~/components/verification'

export default createCommand({
  permissions: ['Administrator'],
  data: new SlashCommandBuilder()
    .setName('setup-verification')
    .setDescription('Setup the verification system for your server.'),
  async execute({ interaction }) {
    await interaction.reply({ embeds: [verifyEmbed], components: [verifyRow] })
  }
})
