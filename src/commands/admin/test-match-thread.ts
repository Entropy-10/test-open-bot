import { createCommand, ephem } from 'zenith'
import env from '@env'
import {
  SlashCommandBuilder,
  TextChannel,
  ThreadAutoArchiveDuration
} from 'discord.js'

import { matchEmbed } from '~/components/match-thread'

export default createCommand({
  devOnly: true,
  data: new SlashCommandBuilder()
    .setName('test-match-thread')
    .setDescription('Create a match thread for a TEST Tournament match.'),
  async execute({ interaction }) {
    const matchChannel = await interaction.guild?.channels.fetch(
      env.MATCH_CHANNEL_ID
    )

    if (!matchChannel) {
      return await interaction.reply(ephem('Match channel not found.'))
    }

    if (!(matchChannel instanceof TextChannel)) {
      return await interaction.reply(ephem('Match channel is not text based.'))
    }

    const matchThread = await matchChannel.threads.create({
      name: 'RO32: Team 1 vs Team 2',
      autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
      reason: 'TEST Open match thread for RO32: Team 1 vs Team 2.'
    })

    if (matchThread.joinable) await matchThread.join()

    await matchThread.members.add('1098012402324349070')
    await matchThread.send({ embeds: [matchEmbed] })

    return await interaction.reply(ephem('Match thread created.'))
  }
})
