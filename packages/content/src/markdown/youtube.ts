import oxContent from '@ox-content/napi';

const { transformYoutubeEmbeds } = oxContent;

const legacyYouTubePattern =
	/<YouTube\s+youTubeId=(['"])([^'"]+)\1(?:\s+skipTo=\{\{\s*h:\s*(\d+)\s*,\s*m:\s*(\d+)\s*,\s*s:\s*(\d+)\s*\}\})?\s*\/>/g;

/**
 * Converts legacy Svelte YouTube tags into Ox Content embeds while retaining
 * their optional playback start time.
 *
 * @param line - A Markdown source line outside a fenced code block.
 * @returns The line with legacy YouTube tags replaced by iframe embeds.
 * @example
 * replaceLegacyYouTubeEmbeds('<YouTube youTubeId="dQw4w9WgXcQ" />');
 */
export function replaceLegacyYouTubeEmbeds(line: string) {
	return line.replace(
		legacyYouTubePattern,
		(_match, _quote: string, id: string, hours?: string, minutes?: string, seconds?: string) => {
			const embed = transformYoutubeEmbeds(`<youtube id="${id}" />`);
			if (hours == null || minutes == null || seconds == null) {
				return embed;
			}

			const startSeconds = Number(hours) * 3_600 + Number(minutes) * 60 + Number(seconds);
			return embed.replace(`/embed/${id}`, `/embed/${id}?start=${startSeconds}`);
		},
	);
}

if (import.meta.vitest != null) {
	test('replaces a legacy YouTube embed without a start time', () => {
		const html = replaceLegacyYouTubeEmbeds('<YouTube youTubeId="dQw4w9WgXcQ" />');

		expect(html).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"');
		expect(html).not.toContain('start=');
	});

	test('preserves the start time of a legacy YouTube embed', () => {
		const html = replaceLegacyYouTubeEmbeds(
			'<YouTube youTubeId="dQw4w9WgXcQ" skipTo={{ h: 1, m: 9, s: 50 }} />',
		);

		expect(html).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=4190"');
	});
}
