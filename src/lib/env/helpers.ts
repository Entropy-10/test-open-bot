import chalk from 'chalk'
import { safeParse } from 'valibot'

import type { BaseSchema, PipeResult } from 'valibot'

export function handleParse<TSchema extends BaseSchema>(schema: TSchema) {
	const result = safeParse(schema, Bun.env)
	if (result.success) return result.output

	let issues = ''
	for (const issue of result.issues) {
		issues += issue.path
			? `❌ Missing env: ${chalk.bold(issue.path?.[0].key)}\n`
			: '❌ Missing env variable, check your .env file.\n'
	}

	console.log(issues)
	process.exit(1)
}

export function fromEnv() {
	return (input: string): PipeResult<string> => {
		const transformedInput = input.replace('""', '')
		if (transformedInput === '') {
			return {
				issues: [
					{
						validation: 'undefined_var',
						message: 'Environment variable not defined',
						input: transformedInput
					}
				]
			}
		}
		return { output: transformedInput }
	}
}

// export type FromEnvTransformer<TInput extends string> = BaseTransformation<TInput>

// export function newFromEnv<TInput extends string>(): FromEnvTransformer<TInput> {
// 	return {

// 	}
// }
