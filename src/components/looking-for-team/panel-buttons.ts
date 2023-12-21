import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

const createPost = new ButtonBuilder()
  .setCustomId('create-post')
  .setLabel('Create Post')
  .setStyle(ButtonStyle.Success)

const deletePost = new ButtonBuilder()
  .setCustomId('delete-post')
  .setLabel('Delete Old Post')
  .setStyle(ButtonStyle.Danger)

export const panelRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
  createPost,
  deletePost
])
