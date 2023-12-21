import { createCommand } from 'zenith'
import { SlashCommandBuilder } from 'discord.js'

export default createCommand({
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll a random number between 1 and 100.')
    .addNumberOption(option =>
      option
        .setName('max')
        .setDescription('The maximum number to roll.')
        .setRequired(false)
    ),
  async execute({ interaction }) {
    const number = interaction.options.getNumber('max')
    const max = number ? Math.floor(number) : 100

    await interaction.reply({
      content: `${Math.floor(Math.random() * max) + 1}`
    })
  }
})
