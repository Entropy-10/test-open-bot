import { createCommand, ephem } from 'zenith'
import env from '@env'
import { embedColor, mention } from '@utils'
import dayjs from 'dayjs'
import {
  EmbedBuilder,
  ModalSubmitInteraction,
  SlashCommandBuilder
} from 'discord.js'

import { createTicketButtonRow, ticketModal } from '~/components/ticket'

import type { GuildTextBasedChannel } from 'discord.js'

export default createCommand({
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription(
      'Report bugs or request features for our website or EclipseBot.'
    )
    .addStringOption(option =>
      option
        .setName('application')
        .setDescription('Choose what application you are opening a ticket for.')
        .setRequired(true)
        .setChoices(
          { name: 'TEST Bot', value: 'bot' },
          { name: 'Website', value: 'website' },
          { name: 'Sheets', value: 'sheets' }
        )
    )
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Choose what type of ticket you are opening.')
        .setRequired(true)
        .addChoices(
          { name: 'Bug/Issue', value: 'bug' },
          { name: 'Feature Request', value: 'feature' }
        )
    ) as SlashCommandBuilder,
  async execute({ interaction }) {
    const application = interaction.options.getString('application')
    const type = interaction.options.getString('type')

    await interaction.showModal(ticketModal)

    const filter = (i: ModalSubmitInteraction) => {
      return i.customId === 'ticket' && i.user.id === interaction.user.id
    }
    const modalSubmit = await interaction.awaitModalSubmit({
      filter,
      time: 60000 * 30
    })

    const ticketsChannel = interaction.guild?.channels.cache.get(
      env.TICKET_CHANNEL
    ) as GuildTextBasedChannel
    const subject = modalSubmit.fields.getTextInputValue('subjectInput')
    const description = modalSubmit.fields.getTextInputValue('descriptionInput')

    const ticketEmbed = new EmbedBuilder()
      .setTitle('|--- Ticket ---|')
      .setThumbnail(interaction.user.avatarURL())
      .setColor(embedColor)
      .addFields(
        { name: 'User', value: `<@${interaction.user.id}>` },
        { name: 'Application', value: `\`${application}\``, inline: true },
        { name: 'Type', value: `\`${type}\``, inline: true },
        { name: 'Subject', value: `\`${subject}\`` },
        { name: 'Description', value: `\`\`\`${description}\`\`\`` },
        { name: 'Ticket Id', value: `\`${modalSubmit.id}\`` }
      )
      .setFooter({
        text: `Ticket opened: ${dayjs().format('M/DD/YYYY, h:mm A')}`
      })

    await ticketsChannel.send({
      content: `${mention(env.DEV_ROLE, 'role')} a new ticket has been opened.`,
      embeds: [ticketEmbed],
      components: [createTicketButtonRow()]
    })

    await modalSubmit.reply(
      ephem(
        'Your ticket has now been opened. TEST Bot will update you as the status on your ticket changes.'
      )
    )

    await interaction.user.send({ embeds: [ticketEmbed] })
  }
})
