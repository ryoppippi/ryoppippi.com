/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path, { join } from "node:path";
import { createHash } from 'node:crypto';
import { favicons } from "favicons";
import { isProduction } from 'std-env';

const staticDir = join(import.meta.dirname, '../static');
const assetDir = join(staticDir, '../src/lib/assets/');
const src = join(assetDir, 'ryoppippi.png');
const dest = join(staticDir, './favicons');
const htmlDest = join(assetDir, 'favicons.html');

async function main() {
	if (existsSync(dest)) {
		fs.rm(dest, { recursive: true });
	}

	/** @satisfies {import('favicons').FaviconOptions} */
	const configuration = {
		path: `/favicons`,
		theme_color: '#001330',
	};

	const cacheKey = `<!-- ${createHash('md5').update(JSON.stringify(configuration) + await fs.readFile(src, 'utf-8')).digest('hex')} -->`;
	if (existsSync(htmlDest) && !isProduction) {
		const oldHTML = await fs.readFile(htmlDest, 'utf-8');
		if (oldHTML.endsWith(cacheKey)) {
			console.log('Cache Hit');
			return;
		}
	}

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

	await fs.writeFile(htmlDest, response.html.join('\n') + cacheKey);
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
