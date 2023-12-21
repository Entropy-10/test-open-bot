import { createCommand, ephem } from 'zenith'
import env from '@env'
import { channelFetch } from '@utils'
import { supabase } from '@supabase'
import { SlashCommandBuilder } from 'discord.js'

import { panelEmbed, panelRow } from '~/components/looking-for-team'

export default createCommand({
  permissions: ['Administrator'],
  data: new SlashCommandBuilder()
    .setName('setup-looking-for-team')
    .setDescription('Setup the looking for team channel.'),
  execute: async ({ client: { logger }, interaction }) => {
    const guild = interaction.guild!
    const channel = await channelFetch(guild, env.LOOKING_FOR_TEAM_CHANNEL)

    if (!channel) {
      return interaction.reply(
        ephem('The looking for team channel was not found.')
      )
    }

    if (!channel.isTextBased()) {
      return await interaction.reply(
        ephem(
          'You can only setup a text channel as the looking for team channel.'
        )
      )
    }

    const message = await channel.send({
      embeds: [panelEmbed],
      components: [panelRow]
    })

    const { error } = await supabase.from('looking-for-team-panel').upsert({
      guild_id: guild.id,
      message_id: message.id,
      updated_at: new Date().toISOString()
    })

    if (error) {
      await message.delete().catch(err => logger.error(err))
      return await interaction.reply(
        ephem('Failed to send looking for team panel.')
      )
    }

    return await interaction.reply(
      ephem('Successfully sent looking for team panel.')
    )
  }
})
