/** One published talk and its supporting links. */
export type Talk = {
	title: string;
	date: string;
	lang?: string;
	event: string;
	eventLink?: string;
	videoLink?: string;
	links: string[];
};

/** Loads the talk catalogue maintained on the speaker's talks site. */
export async function loadTalks(): Promise<Talk[]> {
	const response = await fetch('https://talks.ryoppippi.com/talks.json');
	if (!response.ok) {
		throw new Error(`Failed to fetch talks: ${response.status} ${response.statusText}`);
	}
	return (await response.json()) as Talk[];
}
