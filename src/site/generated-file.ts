/** A file emitted by the static site generator. */
export type GeneratedFile = {
	/** Relative path below the generated site directory. */
	path: string;
	/** Serialized file contents. */
	content: string;
	/** Repository paths whose meaningful changes update the generated file. */
	sourcePaths?: readonly string[];
};
