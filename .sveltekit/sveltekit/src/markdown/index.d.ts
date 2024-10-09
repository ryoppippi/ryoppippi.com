import type { EmptyObject } from 'type-fest';
import type { Component } from 'svelte';

export type MarkdownImport<T> = {
	default: Component<EmptyObject>;
	metadata: T;
};
