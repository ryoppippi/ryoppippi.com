export type Genre = string;
export type Project = {
	name: string;
	link?: string;
	slug?: string;
	description?: string | null;
	icon: string;
};

export type Projects = Record<Genre, Project[]>;

export type GHRepo = {
	repo: {
		name: string;
		description: string | null;
		stars: number;
		watchers: number;
		forks: number;
		createdAt: string;
		pushedAt: string;
		updatedAt: string;
	};
};
