import { scope } from 'arktype';

export const { Genre, Repo, GHRes, Project, OssProjects, ParsedProject, ProjectsByGenre } = scope({
	Genre: 'string#genre',
	Project: {
		'name': 'string',
		'link?': 'string',
		'slug?': 'string',
		'description?': 'string | null',
		'icon': 'string',
	},
	Projects: 'Record<Genre, Project[]>',
	Repo: {
		name: 'string',
		description: 'string | null',
		stars: 'number',
		watchers: 'number',
		forks: 'number',
		createdAt: 'string',
		pushedAt: 'string',
		updatedAt: 'string',
	},
	GHRes: {
		repo: 'Repo',
	},
	OssProjects: 'Record<Genre, Project[]>',
	ParsedProject: 'Required<Project> & Repo',
	ProjectsByGenre: 'Record<Genre, ParsedProject[]>',
}).export();
