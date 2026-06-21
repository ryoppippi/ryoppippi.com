import './style.css';

function applyTheme(theme: 'dark' | 'light'): void {
	document.documentElement.classList.toggle('dark', theme === 'dark');
	localStorage.setItem('theme', theme);
}

const storedTheme = localStorage.getItem('theme');
applyTheme(storedTheme === 'dark' || (storedTheme == null && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light');

document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
	applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
});

for (const input of document.querySelectorAll<HTMLInputElement>('[data-filter]')) {
	input.addEventListener('change', () => {
		const english = document.querySelector<HTMLInputElement>('[data-filter="english"]')?.checked === true;
		const local = document.querySelector<HTMLInputElement>('[data-filter="local"]')?.checked === true;
		for (const item of document.querySelectorAll<HTMLElement>('.blog-item')) {
			item.hidden = (english && item.dataset.lang !== 'en') || (local && item.dataset.origin !== 'local');
		}
	});
}
