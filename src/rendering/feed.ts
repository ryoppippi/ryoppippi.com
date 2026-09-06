import type { FeedChannelOptions, FeedItemInput, RenderedFeedFile } from '@ox-content/vite-plugin';
import { renderFeedFiles, resolveFeedsOptions } from '@ox-content/vite-plugin';
import { SITE_NAME, SITE_ORIGIN } from '../config/site.ts';

/**
 * Renders a feed through Ox Content for the development host.
 *
 * @param channel - Page-owned channel configuration.
 * @param items - Page-owned entries.
 * @param expectedPath - Expected output path relative to the site root.
 * @returns The rendered file, failing if the framework cannot produce it.
 */
export async function renderRssFeed(
	channel: FeedChannelOptions,
	items: readonly FeedItemInput[],
	expectedPath: string,
): Promise<RenderedFeedFile> {
	const result = await renderFeedFiles({
		base: channel.path ?? '/',
		items,
		options: resolveFeedsOptions(channel),
		siteName: SITE_NAME,
		siteUrl: SITE_ORIGIN,
	});
	if (result.warning != null) {
		throw new Error(result.warning);
	}
	const feed = result.files.find((file) => file.path === expectedPath);
	if (feed == null) {
		throw new Error(`[site] Ox Content did not render ${expectedPath}`);
	}
	return feed;
}
