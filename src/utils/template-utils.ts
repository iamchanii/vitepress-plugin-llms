import type { GrayMatterFile, Input } from 'gray-matter'
import type { LinksExtension, VitePressConfig } from '@/internal-types'
import type { LlmstxtSettings } from '@/types'
import { stripExtPosix, transformToPosixPath } from '@/utils/file-utils'

/**
 * Creates a regular expression to match a specific template variable in the format `{key}`.
 *
 * @param key - The name of the template variable to match.
 * @returns A case-insensitive regular expression that detects `{key}` occurrences in a string.
 *
 * @example
 * ```ts
 * const regex = templateVariable('name');
 * console.log(regex.test('Hello {name}')); // true
 * ```
 */
const templateVariable = (key: string): RegExp => new RegExp(`(\\n\\s*\\n)?\\{${key}\\}`, 'gi')

/**
 * Replaces occurrences of a template variable `{variable}` in a given content string with a provided value.
 * If the value is empty or undefined, it falls back to a specified fallback value.
 *
 * @param content - The template string containing placeholders.
 * @param variable - The template variable name to replace.
 * @param value - The value to replace the variable with.
 * @param fallback - An optional fallback value if `value` is empty.
 * @returns A new string with the template variable replaced.
 *
 * @example
 * ```ts
 * const template = 'Hello {name}!';
 * const result = replaceTemplateVariable(template, 'name', 'Alice', 'User');
 * console.log(result); // 'Hello Alice!'
 * ```
 */
export function replaceTemplateVariable(
	content: string,
	variable: string,
	value: string | undefined,
	fallback?: string,
): string {
	return content.replace(templateVariable(variable), (_, prefix) => {
		const val = value?.length ? value : fallback?.length ? fallback : ''
		return val ? `${prefix ? '\n\n' : ''}${val}` : ''
	})
}

/**
 * Expands a template string by replacing multiple template variables with their corresponding values.
 *
 * @param template - The template string containing placeholders.
 * @param values - An object mapping variable names to their respective values.
 * @returns A string with all template variables replaced.
 *
 * @example
 * ```ts
 * const template = 'Hello {name}, welcome to {place}!';
 * const values = { name: 'Alice', place: 'Wonderland' };
 * const result = expandTemplate(template, values);
 * console.log(result); // 'Hello Alice, welcome to Wonderland!'
 * ```
 */
export const expandTemplate = (template: string, variables: Record<string, string | undefined>): string => {
	return Object.entries(variables).reduce(
		(result, [key, value]) => replaceTemplateVariable(result, key, value),
		template,
	)
}

// spell-checker:words flowdown
/**
 * Generates a complete link by combining a domain, path, and an optional extension.
 *
 * @param domain - The base domain of the link (e.g., "https://example.com").
 * @param urlPath - The path to append to the domain (e.g., "guide").
 * @param extension - An optional extension to append to the path (e.g., ".md").
 * @param base - The base URL path from VitePress config (e.g., "/docs/flowdown").
 * @returns The generated link
 */
export const generateLink = (
	urlPath: string,
	domain?: string,
	extension?: LinksExtension,
	base?: VitePressConfig['base'],
): string =>
	expandTemplate('{domain}/{base}{path}{extension}', {
		domain: domain || '',
		base: base ? `${base.slice(base.startsWith('/') ? 1 : 0) + (!base.endsWith('/') ? '/' : '')}` : '',
		path: transformToPosixPath(urlPath),
		extension: extension,
	})

/**
 * Options for generating metadata for markdown files.
 */
export interface GenerateMetadataOptions {
	/** Optional domain name to prepend to the URL. */
	domain?: LlmstxtSettings['domain']

	/** Path to the file relative to the content root. */
	filePath: string

	/** The link extension for generated links. */
	linksExtension?: LinksExtension

	/** The base URL path from VitePress config.
	 *
	 * {@link VitePressConfig.base}
	 */
	base?: VitePressConfig['base']
}

/**
 * Generates metadata for markdown files to provide additional context for LLMs.
 *
 * @param sourceFile - Parsed markdown file with frontmatter using gray-matter.
 * @param options - Options for generating metadata.
 * @returns Object containing metadata properties for the file.
 *
 * @example
 * generateMetadata(preparedFile, { domain: 'https://example.com', filePath: 'docs/guide' })
 * // Returns { url: 'https://example.com/docs/guide.md', description: 'A guide' }
 */
export function generateMetadata(
	sourceFile: GrayMatterFile<Input>,
	{ domain, filePath, linksExtension, base }: GenerateMetadataOptions,
): { url: string; description?: string } {
	return {
		url: generateLink(stripExtPosix(filePath), domain, linksExtension ?? '.md', base),
		...(sourceFile.data?.['description'] && { description: sourceFile.data['description'] }),
	}
}
