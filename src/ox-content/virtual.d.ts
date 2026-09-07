declare module 'virtual:site/ssr-styles' {
	const styles: { sharedStyles: string[]; pageStyles: Record<string, string[]> };
	export default styles;
}
