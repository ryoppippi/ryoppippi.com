import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { fontAssets } from '../font-assets.js';

await Promise.all(
	fontAssets.map(async ({ packageName, fileName }) => {
		const source = join('node_modules', packageName, 'files', fileName);
		const destination = join('static', 'fonts', fileName);

		await mkdir(dirname(destination), { recursive: true });
		await copyFile(source, destination);
	}),
);
