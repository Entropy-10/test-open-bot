import { createEvent, ephem } from 'zenith'
import env from '@env'
import { mention } from '@utils'
import { GuildMemberRoleManager } from 'discord.js'

import { createTicketButtonRow } from '~/components/ticket'

export default createEvent('interactionCreate', {
  name: 'Ticket Status Handler',
  execute: async (client, interaction) => {
    const buttonIds = ['finished', 'inprogress', 'denied']
    if (!interaction.isButton()) return
    if (!buttonIds.includes(interaction.customId)) return

    const member = interaction.member
    if (!member || !(member.roles instanceof GuildMemberRoleManager)) return

    if (!member.roles.cache.has(env.DEV_ROLE)) {
      return interaction.reply(
        ephem("You must be a developer to change a ticket's status.")
      )
    }

    const ticketAuthorMatch =
      interaction.message.embeds[0].fields[0].value.match(/\d+/g)
    if (!ticketAuthorMatch) return

    const ticketAuthor = await client.users.fetch(ticketAuthorMatch[0])
    const ticketStatus =
      interaction.customId === 'inprogress'
        ? '`in progress`'
        : `\`${interaction.customId}\``

    await interaction.message.edit({
      components: [createTicketButtonRow(interaction)]
    })
    await interaction.reply(
      `${mention(
        interaction.user.id
      )} has marked this ticket as ${ticketStatus}.`
    )
    await ticketAuthor.send(
      `Ticket \`${interaction.message.embeds[0].fields[5].value}\` has been marked as ${ticketStatus}.`
    )
  }
})
