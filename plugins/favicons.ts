/* eslint-disable no-console */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import type { Plugin } from 'vite';
import { type FaviconOptions, favicons } from 'favicons';
import { isProduction } from 'std-env';

export type Options = {
	/** faviconの画像のパス */
	imgSrc: string;

	/** faviconの出力先のDirectory */
	faviconAssetsDest: string;

	/** faviconのhtmlの出力先のFile */
	htmlDest: string;
} & FaviconOptions;

function getParentDirPath(p: string): string {
	return path.dirname(p);
}

export function faviconPlugin(options: Options): Plugin {
	const { imgSrc, faviconAssetsDest, htmlDest, ...faviconConfig } = options;
	return {
		name: `favicons`,
		enforce: `pre`,
		async buildStart() {
			console.log('build start');

			/** cache key */
			const cacheKey = `<!-- ${createHash('md5').update(JSON.stringify(options) + await fs.readFile(imgSrc, 'utf-8')).digest('hex')} -->`;

			/* cacheがある場合は再生成しない */
			if (existsSync(htmlDest) && !isProduction) {
				const oldHTML = await fs.readFile(htmlDest, 'utf-8');
				/* html file 末尾にcache keyがあれば再生成しない */
				if (oldHTML.endsWith(cacheKey)) {
					console.log('Cache Hit');
					return;
				}
			}

			/* 既存のファイルを削除 */
			if (existsSync(faviconAssetsDest)) {
				await fs.rm(faviconAssetsDest, { recursive: true });
			}

			/* 既存のhtmlを削除 */
			if (existsSync(htmlDest)) {
				await fs.rm(htmlDest);
			}

			/* faviconのdirectoryをstaticに作成 */
			await fs.mkdir(faviconAssetsDest, { recursive: true });
			await fs.mkdir(getParentDirPath(htmlDest), { recursive: true });

			/* faviconsの生成 */
			const response = await favicons(imgSrc, faviconConfig);

			await Promise.all([
				/* 生成したfavicon 画像を書き出し */
				...response.images.map(async image => fs.writeFile(path.resolve(faviconAssetsDest, image.name), image.contents)),
				/* 生成したfavicon ファイルを書き出し */
				...response.files.map(async file => fs.writeFile(path.resolve(faviconAssetsDest, file.name), file.contents)),
				/* 生成したhtmlを書き出し 末尾にcache keyを追加 */
				fs.writeFile(htmlDest, response.html.join('\n') + cacheKey),
			]);

			console.log('Favicon generated');
		},
	};
};
