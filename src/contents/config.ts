import { defineCollection, z } from 'astro:content';
import { parse as dateParse } from 'date-fns';

// dateParse(date, 'yyyy-MM-dd', new Date()).toJSON()
const blogCollection = defineCollection({
	type: 'content', // v2.5.0 and later
	schema: z.object({
		title: z.string(),
		date: z.string().transform(val => dateParse(val, 'yyyy-MM-dd', new Date()).toJSON()),
	}),
});

export const collections = {
	blog: blogCollection,
};
