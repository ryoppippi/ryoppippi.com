import '@/pages/blog/article/ArticleContent.css';

test('article prose preserves Tweet-specific avatar rounding', () => {
	const nextBody = document.createElement('body');
	nextBody.innerHTML = `
			<article class="prose">
				<figure class="ox-tweet ox-tweet--full">
					<img class="ox-tweet__avatar ox-tweet__avatar--circle" alt="Circle profile" />
					<img class="ox-tweet__avatar ox-tweet__avatar--square" alt="Square profile" />
				</figure>
			</article>
		`;
	document.body.replaceWith(nextBody);

	const circle = document.querySelector<HTMLImageElement>('[alt="Circle profile"]');
	const square = document.querySelector<HTMLImageElement>('[alt="Square profile"]');
	assert.isNotNull(circle);
	assert.isNotNull(square);
	expect(getComputedStyle(circle).borderRadius).toBe('9999px');
	expect(getComputedStyle(square).borderRadius).toBe('4px');
});
