import { createEvent, ephem } from 'zenith'
import env from '@env'
import { GuildMemberRoleManager } from 'discord.js'

export default createEvent('interactionCreate', {
  name: 'Verification Handler',
  execute: async (_, interaction) => {
    if (!interaction.isButton() || interaction.customId !== 'verify') return

    const member = interaction.member
    if (!member || !(member.roles instanceof GuildMemberRoleManager)) return

    if (member.roles.cache.has(env.VERIFIED_ROLE)) {
      return interaction.reply(ephem('You are already verified!'))
    }

    if (member.roles.cache.has(env.UNVERIFIED_ROLE)) {
      await member.roles.remove(env.UNVERIFIED_ROLE)
    }

    await member.roles.add(env.VERIFIED_ROLE)

    await interaction.reply(ephem('You are now verified!'))
  }
})
