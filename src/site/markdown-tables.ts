const TABINDEX_FLAG = 'oxTableScrollTabindex';
const LABEL_FLAG = 'oxTableScrollLabel';

function scrollLabel(root: ParentNode): string {
	const locale = root.ownerDocument?.documentElement.lang ?? document.documentElement.lang;
	return locale.toLowerCase().startsWith('ja') ? '横スクロールできる表' : 'Scrollable table';
}

/**
 * Makes genuinely overflowing Markdown tables keyboard-scrollable.
 *
 * @param root - Document subtree containing rendered Markdown tables.
 * @returns The number of tables that currently overflow horizontally.
 */
export function enhanceMarkdownTables(root: ParentNode = document): number {
	let count = 0;
	for (const table of root.querySelectorAll('.content table')) {
		if (!(table instanceof HTMLElement) || table.tagName !== 'TABLE') {
			continue;
		}

		const scrollable = table.scrollWidth > table.clientWidth + 1;
		table.toggleAttribute('data-ox-table-scrollable', scrollable);
		if (scrollable) {
			count++;
			if (!table.hasAttribute('tabindex')) {
				table.tabIndex = 0;
				table.dataset[TABINDEX_FLAG] = 'true';
			}
			if (!table.hasAttribute('aria-label') && !table.hasAttribute('aria-labelledby')) {
				table.setAttribute('aria-label', scrollLabel(root));
				table.dataset[LABEL_FLAG] = 'true';
			}
			continue;
		}

		if (table.dataset[TABINDEX_FLAG] === 'true') {
			table.removeAttribute('tabindex');
			delete table.dataset[TABINDEX_FLAG];
		}
		if (table.dataset[LABEL_FLAG] === 'true') {
			table.removeAttribute('aria-label');
			delete table.dataset[LABEL_FLAG];
		}
	}
	return count;
}
