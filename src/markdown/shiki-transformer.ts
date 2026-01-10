import type { ShikiTransformer } from 'shiki';

const entities = [
	[/\{/g, '&#123;'],
	[/\}/g, '&#125;'],
] as const satisfies [RegExp, string][];

export function transformerEscape(): ShikiTransformer {
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
