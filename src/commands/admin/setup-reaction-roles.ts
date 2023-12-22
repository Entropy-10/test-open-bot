import { createCommand, ephem } from 'zenith'
import env from '@env'
import { channelFetch } from '@utils'
import { SlashCommandBuilder } from 'discord.js'

import { pingsEmbed, pingsRow } from '~/components/reaction-roles'

export default createCommand({
  permissions: ['Administrator'],
  data: new SlashCommandBuilder()
    .setName('setup-reaction-roles')
    .setDescription('Setup reaction roles.'),
  async execute({ interaction }) {
    if (!interaction.guild) return
    const reactionChannel = await channelFetch(
      interaction.guild,
      env.REACTION_CHANNEL_ID
    )

    if (!reactionChannel || !reactionChannel.isTextBased()) {
      return interaction.reply(ephem('Invalid reaction channel.'))
    }

    await reactionChannel.send({ embeds: [pingsEmbed], components: [pingsRow] })

    return await interaction.reply(ephem('Successfully setup reaction roles.'))
  }
})
