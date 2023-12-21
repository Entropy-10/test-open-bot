import { createEvent, ephem } from 'zenith'
import env from '@env'
import { supabase } from '@supabase'
import { getMatch, mention } from '@utils'
import { ModalSubmitInteraction } from 'discord.js'
import { LegacyClient } from 'osu-web.js'

import { panelEmbed, panelRow, postModal } from '~/components/looking-for-team'
import { createPostEmbed } from '~/components/looking-for-team/post-embed'

export default createEvent('interactionCreate', {
  name: 'Looking For Team Handler',
  execute: async ({ logger }, interaction) => {
    if (!interaction.isButton()) return
    if (!['create-post', 'delete-post'].includes(interaction.customId)) return

    if (!interaction.guild || !interaction.channel) {
      await interaction.reply(ephem('Failed to get guild or channel.'))
      return logger.error('Interaction is not in a guild or channel.')
    }

    if (interaction.customId === 'delete-post') {
      const { error: postSelectError, data: post } = await supabase
        .from('looking-for-team-post')
        .select()
        .eq('user_id', interaction.user.id)
        .maybeSingle()

      if (postSelectError) {
        postCreateError()
        return logger.error(`Failed to select post: ${postSelectError.message}`)
      }

      if (post) {
        const existingPostMessage = await interaction.channel.messages
          .fetch(post.message_id)
          .catch(err => {
            postCreateError()
            return logger.error(`Failed to fetch post message: ${err.message}`)
          })

        existingPostMessage?.delete()
        await supabase
          .from('looking-for-team-post')
          .delete()
          .eq('user_id', interaction.user.id)

        await interaction.reply(ephem('Successfully deleted posts.'))
      }

      return
    }

    await interaction.showModal(postModal)

    const filter = (i: ModalSubmitInteraction) => {
      return (
        i.customId === 'looking-for-team-post' &&
        i.user.id === interaction.user.id
      )
    }
    const submit = await interaction.awaitModalSubmit({
      filter,
      time: 60000 * 30
    })

    const strengths = submit.fields.getTextInputValue('strengthsInput')
    const weaknesses = submit.fields.getTextInputValue('weaknessesInput')
    const osuProfile = getMatch(
      submit.fields.getTextInputValue('osuProfileInput'),
      /(?:https:\/\/osu\.ppy\.sh\/users\/)?(\d+)/
    )
    const timezone = getMatch(
      submit.fields.getTextInputValue('timezoneInput'),
      /([-+]\d+)/
    )

    if (!osuProfile) {
      const message = await interaction.channel.send({
        content: `${mention(
          interaction.user.id
        )} Incorrect osu profile format. Enter either your profile link or id. Please try again!`
      })

      setTimeout(() => message.delete(), 20000)
      return
    }

    if (!timezone) {
      const message = await interaction.channel.send(
        `${mention(
          interaction.user.id
        )} Incorrect timezone format. Enter your UTC timezone (ex: UTC-7). Please try again!`
      )

      setTimeout(() => message.delete(), 20000)
      return
    }

    const osuApi = new LegacyClient(env.OSU_API_KEY)
    const user = await osuApi.getUser({ u: osuProfile })

    if (!user) {
      logger.error('Failed to get osu user.')
      const message = await interaction.channel.send(
        `${mention(
          interaction.user.id
        )} Sorry I failed to get your osu profile.`
      )

      setTimeout(() => message.delete(), 20000)
      return
    }

    async function postCreateError() {
      const errorMessage = await interaction.channel!.send(
        `${mention(interaction.user.id)}, sorry I failed to create your post.`
      )

      setTimeout(() => errorMessage.delete(), 20000)
      return
    }

    const { error: postSelectError, data: post } = await supabase
      .from('looking-for-team-post')
      .select()
      .eq('user_id', interaction.user.id)
      .maybeSingle()

    if (postSelectError) {
      postCreateError()
      return logger.error(`Failed to select post: ${postSelectError.message}`)
    }

    if (post) {
      const existingPostMessage = await interaction.channel.messages
        .fetch(post.message_id)
        .catch(err => {
          postCreateError()
          return logger.error(`Failed to fetch post message: ${err.message}`)
        })

      existingPostMessage?.delete()
    }

    const postMessage = await interaction.channel.send({
      embeds: [
        createPostEmbed({
          interaction,
          user,
          timezone,
          strengths,
          weaknesses
        })
      ]
    })

    const { error: postInsertError } = await supabase
      .from('looking-for-team-post')
      .insert({
        message_id: postMessage.id,
        user_id: interaction.user.id,
        updated_at: new Date().toISOString()
      })

    if (postInsertError) {
      postCreateError()
      await postMessage.delete()
      return logger.error(`Failed to insert post: ${postInsertError.message}`)
    }

    const { error: panelSelectError, data: panel } = await supabase
      .from('looking-for-team-panel')
      .select()
      .eq('guild_id', interaction.guild.id)
      .single()

    if (panelSelectError) {
      postCreateError()
      await postMessage.delete()
      return logger.error(`Failed to select panel: ${panelSelectError.message}`)
    }

    const oldPanelMessage = await interaction.channel.messages.fetch(
      panel.message_id
    )
    oldPanelMessage.delete()

    const newPanelMessage = await interaction.channel.send({
      embeds: [panelEmbed],
      components: [panelRow]
    })

    const { error: panelUpsertError } = await supabase
      .from('looking-for-team-panel')
      .upsert({
        guild_id: interaction.guild.id,
        message_id: newPanelMessage.id,
        updated_at: new Date().toISOString()
      })

    if (panelUpsertError) {
      postCreateError()
      await postMessage.delete()
      return logger.error(`Failed to upsert panel: ${panelUpsertError.message}`)
    }

    await submit.reply(ephem('Successfully created free player post.'))
  }
})
