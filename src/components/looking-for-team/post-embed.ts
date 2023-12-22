import { embedColor } from '@utils'
import { EmbedBuilder, userMention } from 'discord.js'
import { buildUrl } from 'osu-web.js'

import type { ButtonInteraction } from 'discord.js'
import type { LegacyUser } from 'osu-web.js'

interface PostEmbedOptions {
  interaction: ButtonInteraction
  user: LegacyUser
  timezone: string
  strengths: string
  weaknesses: string
}

export function createPostEmbed({
  interaction,
  user,
  timezone,
  strengths,
  weaknesses
}: PostEmbedOptions) {
  return new EmbedBuilder()
    .setTitle(user.username)
    .setURL(buildUrl.user(user.user_id))
    .setThumbnail(buildUrl.userAvatar(user.user_id))
    .setColor(embedColor)
    .addFields([
      {
        name: 'Discord',
        value: userMention(interaction.user.id),
        inline: true
      },
      { name: 'Timezone', value: `UTC${timezone}`, inline: true },
      { name: 'Country', value: user.country, inline: true },
      {
        name: 'Rank',
        value: `${user.pp_rank.toLocaleString()}`,
        inline: true
      },
      {
        name: 'Accuracy',
        value: `${user.accuracy.toFixed(2)}%`,
        inline: true
      },
      {
        name: 'Total Hours',
        value: `${Math.round(user.total_seconds_played / 3600)}`,
        inline: true
      },
      { name: 'Strengths', value: `\`\`\`${strengths}\`\`\`` },
      { name: 'Weaknesses', value: `\`\`\`${weaknesses}\`\`\`` }
    ])
}
