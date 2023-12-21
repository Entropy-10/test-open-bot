import { BaseMessageOptions } from 'discord.js'

export function ephem(
  content: string,
  options?: Omit<BaseMessageOptions, 'content'>
) {
  return { content, ...options, ephemeral: true }
}
