import { embedColor } from '@utils'
import { EmbedBuilder } from 'discord.js'

export const panelEmbed = new EmbedBuilder()
  .setColor(embedColor)
  .setDescription(
    'In order to post info about yourself, please click the `Create Post` button below. If you already have a post, you can delete it by clicking the `Delete Old Post` button.'
  )
