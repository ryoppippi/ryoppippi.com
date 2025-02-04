/** @type {[RegExp, string][]} */
const entities = [
	[/\{/g, '&#123;'],
	[/\}/g, '&#125;'],
];

/**
 * @returns {import('shiki').ShikiTransformer} Escape brackets
 */
export function transformerEscape() {
	return {
		name: '@shikijs/transformers:escape-brackets',
		postprocess(code) {
			return entities
				.reduce((
					acc,
					[pattern, replacement],
				) => acc.replace(pattern, replacement), code);
		},
	};
}
