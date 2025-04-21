import { scope } from 'arktype';

export const { Genre, GHRepo, Project } = scope({
	Genre: 'string',
	Project: {
		'name': 'string',
		'link?': 'string',
		'slug?': 'string',
		'description?': 'string | null',
		'icon': 'string',
	},
	Projects: 'Record<Genre, Project[]>',
	GHRepo: {
		repo: {
			name: 'string',
			description: 'string | null',
			stars: 'number',
			watchers: 'number',
			forks: 'number',
			createdAt: 'string',
			pushedAt: 'string',
			updatedAt: 'string',
		},
	},
}).export();
