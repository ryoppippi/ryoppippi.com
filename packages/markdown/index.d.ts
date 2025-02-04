import type { Component } from 'svelte';
import type { EmptyObject } from 'type-fest';

export type MarkdownImport<T> = {
	default: Component<EmptyObject>;
	metadata: T;
};
