import env from '@env'
import { readdir } from 'fs/promises'
import { REST, Routes } from 'discord.js'

import { Logger } from './zenith'

import type {
  ApplicationCommand,
  RESTPostAPIChatInputApplicationCommandsJSONBody
} from 'discord.js'

const dirname = import.meta.dir.replace('lib', '')
const globalType = env.GLOBAL_PUSH ? 'global' : 'local'
const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = []
const logger = new Logger()

async function getCommands() {
  const cmdPath = `${dirname}/commands`
  const cmdFolders = await readdir(cmdPath)

  for (const folder of cmdFolders) {
    const cmdFiles = await readdir(`${cmdPath}/${folder}`)
    const filteredCmdFiles = cmdFiles.filter(file => /\.ts$|\.js$/.test(file))

    for (const file of filteredCmdFiles) {
      const filePath = `${cmdPath}/${folder}/${file}`
      const command = (await import(filePath)).default

      if (!command.data || !command.execute) {
        logger.warn(`Invalid command at: ${filePath}`, 'high')
        continue
      }

      commands.push(command.data.toJSON())
      logger.command(command.data.name)
    }
  }
}

const rest = new REST().setToken(env.DISCORD_TOKEN)

async function deployCommands() {
  logger.info(`deploying ${commands.length} commands to ${globalType}`, true)

  let deployData: ApplicationCommand[] = []

  if (env.GLOBAL_PUSH) {
    const guildData = (await rest.put(
      Routes.applicationGuildCommands(env.CLIENT_ID, env.DEV_GUILD),
      { body: [] }
    )) as ApplicationCommand[]

    if (!guildData) {
      return logger.error('aborting... failed to remove guild commands')
    }

    deployData = (await rest.put(Routes.applicationCommands(env.CLIENT_ID), {
      body: commands
    })) as ApplicationCommand[]
  } else {
    deployData = (await rest.put(
      Routes.applicationGuildCommands(env.CLIENT_ID, env.DEV_GUILD),
      { body: commands }
    )) as ApplicationCommand[]
  }

  if (deployData.length === 0) {
    return logger.error(`failed to deploy commands to ${globalType}`)
  }

  logger.success(`deployed ${deployData.length} commands to ${globalType}`)
}

async function run() {
  await getCommands()
  await deployCommands()
}

run()
