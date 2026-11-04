import { generateEslintConfig } from '@companion-module/tools/eslint/config.mjs'

export default [
	...(await generateEslintConfig({
		enableTypescript: true,
	})),
	{
		settings: {
			node: {
				tryExtensions: ['.js', '.json', '.node', '.ts'],
			},
		},
	},
]
