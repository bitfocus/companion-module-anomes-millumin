import { generateEslintConfig } from '@companion-module/tools/eslint/config.mjs'

export default [
	{ ignores: ['test/**', 'pkg/**'] },
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
