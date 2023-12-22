import { embedColor } from '@utils'
import {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder
} from 'discord.js'

const pingsSelectMenu = new StringSelectMenuBuilder()
  .setCustomId('pings')
  .setPlaceholder('Make a selection')
  .setMinValues(1)
  .setMaxValues(4)
  .setOptions(
    {
      label: 'Announcements',
      value: 'general',
      description: 'Get pinged for general announcements'
    },
    {
      label: 'TEST Open',
      value: 'tourney',
      description: 'Get pinged for stuff regarding TEST Open'
    },
    {
      label: 'Streams',
      value: 'stream',
      description: 'Get pinged whenever we go live'
    },
    {
      label: 'Giveaways',
      value: 'giveaway',
      description: 'Get pinged for giveaways'
    },
    {
      label: 'Remove All',
      value: 'remove',
      description: 'Removes all ping roles'
    }
  )

export const pingsRow =
  new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(pingsSelectMenu)

export const pingsEmbed = new EmbedBuilder()
  .setTitle('Select Your Pings')
  .setColor(embedColor)
  .setDescription('Choose what pings you want to receive')
