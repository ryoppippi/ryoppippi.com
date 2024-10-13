import { defineCollection, defineConfig } from '@content-collections/core';
import * as ufo from 'ufo';
import { slugify } from '../lib/slugify.server';
import { parseDate } from './meta.server';

const showcase = defineCollection({
	name: 'showcase',
	directory: 'projects/showcase',
	include: '**/*.md',
	schema: z => ({
		title: z.string(),
		link: z.string(),
		image: z.string().transform(s => ufo.joinURL('/src/content/projects/showcase', s)),
		date: z.string().transform(parseDate),
		featured: z.boolean().optional().default(false),
	}),
	transform: async doc => ({
		...doc,
		slug: slugify(doc._meta.path),
	}),

});

export default defineConfig({
	collections: [showcase],
});
