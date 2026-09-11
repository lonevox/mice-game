import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import sveltePlugin from 'eslint-plugin-svelte';
import globals from 'globals';

export default [
	{
		ignores: [
			'.svelte-kit/**',
			'build/**',
			'node_modules/**',
			'package/**',
			'*.config.js.timestamp-*',
			'*.config.ts.timestamp-*',
		],
	},
	js.configs.recommended,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
	},
	{
		files: ['**/*.ts', '**/*.svelte'],
		plugins: { '@typescript-eslint': tsPlugin },
		languageOptions: {
			parser: tsParser,
			parserOptions: { sourceType: 'module', ecmaVersion: 2020 },
			globals: { ...globals.browser, ...globals.node },
		},
		rules: tsPlugin.configs.recommended.rules,
	},
	...sveltePlugin.configs['flat/recommended'],
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: { parser: tsParser },
		},
	},
	{
		files: ['**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parser: tsParser,
			globals: { $state: 'readonly', $derived: 'readonly' },
		},
		rules: { 'svelte/prefer-svelte-reactivity': 'off' },
	},
	prettier,
];
