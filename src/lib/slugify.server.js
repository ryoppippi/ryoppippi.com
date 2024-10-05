import GithubSlugger from 'github-slugger';

const slugger = new GithubSlugger();

/**
 * @param {string} s
 */
export function slugify(s) {
	return slugger.slug(s);
}
