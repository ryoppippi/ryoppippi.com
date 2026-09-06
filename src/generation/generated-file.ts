/** A file emitted by the static site generator. */
export type GeneratedFile = {
	/** Relative path below the generated site directory. */
	path: string;
	/** Serialized file contents. */
	content: string;
	/** Repository paths whose meaningful changes update the generated file. */
	sourcePaths?: readonly string[];
	/** Exclude this HTML file from discovery outputs such as the sitemap. */
	unlisted?: boolean;
};
