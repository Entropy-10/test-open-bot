import { createCommand, ephem } from 'zenith'
import { embedColor } from '@utils'
import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'

dayjs.extend(LocalizedFormat)

export default createCommand({
  permissions: ['Administrator'],
  data: new SlashCommandBuilder()
    .setName('send-embed')
    .setDescription('Used for sending basic description only embeds.')
    .addStringOption(option =>
      option
        .setName('title')
        .setDescription('The title of the embed.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('content')
        .setDescription('The content of the embed.')
        .setRequired(true)
    )
    .addBooleanOption(option =>
      option
        .setName('modified-date')
        .setDescription(
          'Choose whether to display the last date the embed was modified.'
        )
    ),
  execute: async ({ interaction }) => {
    const title = interaction.options.getString('title')
    const content = interaction.options.getString('content') ?? ''
    const modifiedDate = interaction.options.getBoolean('modified-date')

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setColor(embedColor)
      .setDescription(content.replaceAll('\\n', '\n'))

    if (modifiedDate) {
      embed.setFooter({ text: `Last Modified: ${dayjs().format('LL')}` })
    }

    const embedMsg = await interaction.channel?.send({ embeds: [embed] })
    if (!embedMsg) {
      return await interaction.reply(ephem('Failed to send embed!'))
    }

    return await interaction.reply(ephem('Embed successfully sent!'))
  }
})
