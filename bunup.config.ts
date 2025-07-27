import { defineConfig } from 'bunup'
import { copy } from 'bunup/plugins'

export default defineConfig({
	entry: ['src/index.ts', 'src/vitepress-components/utils.ts'],
	// Generate declaration file (`.d.ts`)
	dts: {
		entry: ['src/index.ts'],
		splitting: true,
	},
	banner: '// Built with bunup (https://bunup.dev)',
	plugins: [copy(['src/vitepress-components/*.vue'], 'dist/vitepress-components')],
})
