import { scope } from 'arktype';

export const { Genre, URL, Repo, Project, OssProjects, ParsedProject, ProjectsByGenre } = scope({
	Genre: 'string#genre',
	URL: 'string#url',
	Project: {
		'name': 'string',
		'link?': 'URL',
		'slug?': 'string',
		'description?': 'string | null',
		'icon': 'string',
	},
	Projects: 'Record<Genre, Project[]>',
	Repo: {
		name: 'string',
		description: 'string | null',
	},
	OssProjects: 'Record<Genre, Project[]>',
	ParsedProject: 'Required<Project> & Repo',
	ProjectsByGenre: 'Record<Genre, ParsedProject[]>',
}).export();
