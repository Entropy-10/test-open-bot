import env from '@env'
import { embedColor, mention } from '@utils'
import { EmbedBuilder, formatEmoji } from 'discord.js'

import type { RoleStatus } from '~/components/reaction-roles'

export function createRoleEmbed(roleStatus: RoleStatus[]) {
  return new EmbedBuilder().setColor(embedColor).setDescription(
    roleStatus
      .map(({ roleId, status, message }) => {
        const role = mention(roleId, 'role')
        switch (status) {
          case 'success':
            return `:white_check_mark: | ${message ?? 'Added role'} ${role}`
          case 'failed':
            return `${formatEmoji(env.CROSS_EMOJI)} | ${
              message ?? 'Failed to add role'
            } ${role}`
          case 'already-exists':
            return `${formatEmoji(
              env.MINUS_EMOJI
            )} | You already have role ${role}`
        }
      })
      .join('\n\n')
  )
}

export const allRolesRemovedEmbed = new EmbedBuilder()
  .setColor(embedColor)
  .setDescription(`:white_check_mark: | All roles removed`)
