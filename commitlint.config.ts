import type { Rule, UserConfig } from '@commitlint/types'
import { RuleConfigSeverity } from '@commitlint/types'
import type { Commit } from 'conventional-commits-parser'

const COMMITLINT_HELP_URL =
	'https://github.com/okineadev/vitepress-plugin-llms/blob/main/CONTRIBUTING.md#conventional-pr-titles'

//#region Rules
/**
 * Rule to ensure the first letter of the commit subject is lowercase.
 *
 * @param parsed - Parsed commit object containing commit message parts.
 * @returns A tuple where the first element is a boolean indicating
 * if the rule passed, and the second is an optional error message.
 */
const subjectLowercaseFirst: Rule = async (parsed: Commit) => {
	const subject = parsed.header.split(': ')[1]
	if (
		subject &&
		subject[0] === subject[0].toUpperCase() &&
		subject.slice(1) === subject.slice(1).toLowerCase()
	) {
		return [false, 'Subject must start with a lowercase letter']
	}
	return [true]
}
//#endregion

const Configuration: UserConfig = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'subject-case': [RuleConfigSeverity.Disabled],
		'subject-lowercase-first': [RuleConfigSeverity.Error, 'always'],
	},
	plugins: [
		{
			rules: {
				'subject-lowercase-first': subjectLowercaseFirst,
			},
		},
	],
	helpUrl: COMMITLINT_HELP_URL,
}

export default Configuration
