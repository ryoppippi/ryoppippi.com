/* eslint-disable no-console */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path, { join } from 'node:path';
import { favicons } from 'favicons';

const staticDir = join(import.meta.dirname, '../static');
const assetDir = join(staticDir, '../src/lib/assets/');
const src = join(assetDir, 'ryoppippi.png');
const dest = join(staticDir, './favicons');
const htmlDest = join(assetDir, 'favicons.html');

async function main() {
	if (existsSync(dest)) {
		fs.rm(dest, { recursive: true });
	}
	fs.mkdir(dest, { recursive: true });

	/** @satisfies {import('favicons').FaviconOptions} */
	const configuration = {
		path: `/favicons`,
	};

	const response = await favicons(src, configuration);
	await fs.mkdir(dest, { recursive: true });

	await Promise.all(
		response.images.map(
			async image =>
				await fs.writeFile(path.join(dest, image.name), image.contents),
		),
	);
	await Promise.all(
		response.files.map(
			async file =>
				await fs.writeFile(path.join(dest, file.name), file.contents),
		),
	);

	await fs.writeFile(htmlDest, response.html.join('\n'));
}

/** @type {import('vite').Plugin} */
export const faviconPlugin = {
	name: 'favicons',
	enforce: 'pre',
	async buildStart() {
		console.log('build start');
		await main();
		console.log('Favicon generated');
	},
};
